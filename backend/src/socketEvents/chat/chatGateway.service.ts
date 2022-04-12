import { Logger } from "@nestjs/common";
import { ChatRoom, ChatMembership } from "src/db/entity/Chat/ChatEntity";
import { User } from "src/db/entity/User/UserEntity";
import { ChatBanListRepository, ChatHistoryRepository, ChatMembershipRepository, ChatRoomRepository } from "src/db/repository/Chat/ChatCustomRepository";
import { BlockedFriendsRepository, FriendsRepository } from "src/db/repository/User/UserCustomRepository";
import { AuthSocket } from "src/type/AuthSocket.interface";
import { getCustomRepository } from "typeorm";
import { onlineChatRoomManager } from "../online/onlineChatRoomManager";
import { hash, compare } from 'bcrypt';
import dotenv from 'dotenv'
import { ENV_PATH } from "src/config/url";

const ENV = dotenv.config({path : ENV_PATH});

export class ChatGatewayService {
	private readonly logger = new Logger();

	private log(msg: any) {
		this.logger.log(msg, "ChatGatewayService")
	}
	public async getChatMemberInfo(chatmember: ChatMembership) {
		let { chatroom, member, position } = chatmember;
		const chatid = chatroom.chatid;
		const userid = member.userid;
		return { chatid, userid, position };
	}

	async createChatRoom(payload: any, user: User): Promise<string> {
		const repo_chatRoom = getCustomRepository(ChatRoomRepository);
		if (payload["password"])
			payload["password"] = await this.hashing(payload["password"]);
		const chatRoom = repo_chatRoom.createChatRoomInfo(payload);
		const res = await repo_chatRoom.insert(chatRoom);
		console.log("insert", res);
		return res.generatedMaps[0].chatid;
	}

	private async createmember(user: User, chatroom: ChatRoom) {
		const repo_chatmember = getCustomRepository(ChatMembershipRepository);
		const chatmember = repo_chatmember.createChatMemberInfo(user, chatroom);
		const res = await repo_chatmember.insert(chatmember);
		return res;
	}

	async createowner(user: User, chatroom: ChatRoom) {
		const repo_chatroom = getCustomRepository(ChatRoomRepository);
		const repo_chatmember = getCustomRepository(ChatMembershipRepository);
		const chatmember = repo_chatmember.createChatOwnerInfo(user, chatroom);
		const res = await repo_chatmember.insert(chatmember);
		await repo_chatroom.update(chatroom.chatid, { memberCount: chatroom.memberCount + 1 });
		return res;
	}

	async managerList(element: ChatMembership) {
		let managers = [];
		// 매니저가 여러명일 경우
		const repo_chat: ChatMembership[] = await getCustomRepository(ChatMembershipRepository).find({ chatroom: element.chatroom });
		const managerList = repo_chat.map((element: ChatMembership) => {
			const manager = element.position;
			if (manager != "manager")
				return;
			managers.push(element.member.userid);
		})
		return managers;
	}

	async enterChatRoom(user: User, chatroom: ChatRoom) {
		// onlineChatMap[];
		// chatmembership insert하기
		console.log("count : ", chatroom.memberCount);
		if (chatroom.memberCount === 100)
			return false;
		const repo_chatroom = getCustomRepository(ChatRoomRepository);
		await this.createmember(user, chatroom);
		await repo_chatroom.update(chatroom.chatid, { memberCount: chatroom.memberCount + 1 });
		console.log("entered");
		return true;
	}

	async kickUserFromChatRoom(user: User, chatid: string) {
		if (!user || !chatid) {
			this.log("Something Wrong");
			return;
		}
		const repo_chatHistory = getCustomRepository(ChatHistoryRepository);
		const repo_chatMember = getCustomRepository(ChatMembershipRepository);
		const repo_chatBanList = getCustomRepository(ChatBanListRepository);
		const repo_chatroom = getCustomRepository(ChatRoomRepository);

		const chatroom = await repo_chatroom.findOne({ chatid: chatid });
		await Promise.all([
			repo_chatBanList.createBanUser(chatroom, user),
			repo_chatMember.deleteChatUser(user.userid, chatid),
			repo_chatHistory.anonymise(user.userid, chatid),]
		);
	}

	async shouldDeleteRoom(chatid: string) {
		// const repo_chatmember = getCustomRepository(ChatMembershipRepository);
		const chatroom = await getCustomRepository(ChatRoomRepository).findOne({ chatid: chatid });
		// const managers = await repo_chatmember.find({ chatroom: { chatid: chatid }, position: "manager" })
		if (chatroom.memberCount === 0)
			return true;
		return false;
	}

	async deleteChatRoom(chatid: string) {
		const repo_chathistory = getCustomRepository(ChatHistoryRepository);
		const repo_chatRoom = getCustomRepository(ChatRoomRepository);
		await repo_chatRoom.delete(chatid);
		onlineChatRoomManager.delete(chatid);
		await repo_chathistory.deleteAllHistory(chatid);
	}

	shouldDelegateOwner(user: ChatMembership): boolean {
		if (user.position === "owner")
			return true;
		return false;
	}

	async delegateteOwner(chatid: string) {
		const repo_chatmember = getCustomRepository(ChatMembershipRepository);
		const room = onlineChatRoomManager.getRoomByid(chatid);
		const newOwner = await repo_chatmember.getNewOwner(chatid);
		if (newOwner) {
			await repo_chatmember.update(newOwner.index, { position: "owner" });
			room.announce("updateChatRoom", { "switchOwner": newOwner.member.userid, "chatid" : chatid }) // edit
		};
	}
	async onlineMyChatRoom(socket: AuthSocket) {
		if (!socket.userid)
			return;
		const repo_chatmember = getCustomRepository(ChatMembershipRepository);
		const myChatList = await repo_chatmember.getMyChatRoom(socket.userid);
		myChatList.map(list => {
			let room = onlineChatRoomManager.getRoomByid(list.chatid);
			if (!room) {
				room = onlineChatRoomManager.create(list.chatid);
			}
			room.join(socket.id);
		})
	}

	async offlineMyChatRoom(socket: AuthSocket) {
		if (!socket.userid)
			return;
		const repo_chatmembership = getCustomRepository(ChatMembershipRepository);
		const myRoomlist = await repo_chatmembership.getMyChatRoom(socket.userid);
		// console.log("myroom : ", myRoomlist);
		myRoomlist.map(list => {
			let onlineChatRoom = onlineChatRoomManager.getRoomByid(list.chatid);
			if (onlineChatRoom)
				onlineChatRoom.leave(socket.id);
		})
	}

	async checkIfIcanInvite(user: User, mem: User) {
		// const repo_friendList = getCustomRepository(FriendsRepository);
		const repo_blockList = getCustomRepository(BlockedFriendsRepository);
		let res = await Promise.all([
			repo_blockList.amIBlockedBy(user, mem),
			repo_blockList.didIBlock(user, mem),
			// repo_friendList.isNotMyFriend(user, mem)
		]);
		if (res.findIndex(value => value === true) === -1)
			return true;
		return false;
	}

	async checkIfcanEnterRoom(user: User, chatroom: ChatRoom, password: string) {
		const repo_chatMember = getCustomRepository(ChatMembershipRepository);
		const repo_banlist = getCustomRepository(ChatBanListRepository);
		if (user.banPublicChat) {
			this.log("you banPublicChat");
			return false;
		}
		if (await repo_banlist.findOne({ chatRoom: chatroom, user: user })) {
			this.log("you baned");
			return false;
		}
		if (chatroom.type === "private") {
			this.log("not invite you");
			return false;
		}
		if (await repo_chatMember.findOne({ chatroom: chatroom, member: user })) {
			this.log("already enter the room");
			return false;
		}
		if (!await this.checkPassword(chatroom, password)) {
			this.log("not match password");
			return false;
		}
		if (chatroom.memberCount === 100) {
			this.log("room is full");
			return false;
		}
		return true;
	}

	async hashing(password: string) {
		console.log("env", ENV.parsed);
		const encodedPassword = await hash(password, Number(ENV.parsed.SALTROUND));
		return encodedPassword;
	}

	async checkPassword(chatroom: ChatRoom, password: string) {
		if (!chatroom.password)
			return true;
		if (password === undefined)
			return false;
		console.log("passwrod : ", password);
		console.log("room encoded pw : ", chatroom.password);
		console.log("input endcoded : ", await this.hashing(password));
		const compareResult = await compare(password, chatroom.password);
		console.log("compare Result : ", compareResult);
		return compareResult;
	}

}