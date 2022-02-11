import { Logger } from "@nestjs/common";
import { ChatRoom, ChatMembership } from "src/db/entity/Chat/ChatEntity";
import { User } from "src/db/entity/User/UserEntity";
import { ChatMembershipRepository, ChatRoomRepository } from "src/db/repository/Chat/ChatCustomRepository";
import { AuthSocket } from "src/type/AuthSocket.interface";
import { getCustomRepository } from "typeorm";
// import { onlineChatMap } from "./online/chatRoom"
// import { onlineManager } from "./online/chatRoomManager";


export class ChatGatewayService {
    private readonly logger = new Logger();
    
    public async getChatMemberInfo(chatmember : ChatMembership) {
        let {chatroom, member, position} = chatmember;
        const chatid = chatroom.chatid;
        const userid = member.userid;
        return {chatid, userid, position};
    }

    async createChatRoom(payload: any, user: User) : Promise<ChatRoom> {
      const repo_chatRoom = getCustomRepository(ChatRoomRepository);
      const chatRoom = repo_chatRoom.createChatRoomInfo(payload);
      await repo_chatRoom.insert(chatRoom);
      return chatRoom;
    }

    async createmember(user: User, chatroom: ChatRoom) {
        const repo_chatmember = getCustomRepository(ChatMembershipRepository);
        const repo_chatroom = getCustomRepository(ChatRoomRepository);
        const chatmember = await repo_chatmember.createChatMemberInfo(user, chatroom);
        await repo_chatmember.insert(chatmember);
        return chatmember;
    }

    async createowner(payload: any, user: User, chatroom: ChatRoom) {
        const repo_chatmember = getCustomRepository(ChatMembershipRepository);
        const repo_chatroom = getCustomRepository(ChatRoomRepository);
        const chatmember = await repo_chatmember.createChatOwnerInfo(user, chatroom);
        await repo_chatmember.insert(chatmember);
        return chatmember;
    }

    async managerList(element : ChatMembership) {
        let managers = [];
        // 매니저가 여러명일 경우
        const repo_chat : ChatMembership[] = await getCustomRepository(ChatMembershipRepository).find({chatroom: element.chatroom});
        const managerList = repo_chat.map((element : ChatMembership) => {
            const manager = element.position;
            if (manager != "manager")
                return ;
            managers.push(element.member.userid);
        })
        return managers;
    }

    async enterChatRoom(socket : AuthSocket, user : User, chatroom: ChatRoom) {
        // onlineChatMap[];
        // chatmembership insert하기
        const repo_chatroom = getCustomRepository(ChatRoomRepository);
        this.createmember(user, chatroom);
        repo_chatroom.update(chatroom.chatid, {memberCount: chatroom.memberCount + 1});
        console.log("2222222222222")
        return ;
    }

    async isLogin(user: User) {
        if (user.status === "login")
            return true;
        return false;
    }
}