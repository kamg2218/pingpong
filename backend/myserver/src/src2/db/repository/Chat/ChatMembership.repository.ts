import { ChatRoom, ChatMembership } from "src/db/entity/Chat/ChatEntity";
import { User } from "src/db/entity/User/UserEntity";
import { EntityRepository, getCustomRepository, Repository } from "typeorm";
import { ChatRoomRepository } from "./ChatCustomRepository";


@EntityRepository(ChatMembership)
export class ChatMembershipRepository extends Repository<ChatMembership> {

    createChatMemberInfo(user: User, chatroom: ChatRoom) : ChatMembership{
        let member = this.create();
        member.chatroom = chatroom;
        member.member = user;
        member.position = "normal";
        return member;
    }

    createChatOwnerInfo(user: User, chatroom: ChatRoom) : ChatMembership {
        let member = this.create();
        member.chatroom = chatroom;
        member.member = user;
        member.position = "owner";
        return member;
    }

    async setAsNormal(userid : string) {
        const membership = await this.findOne({member : {userid : userid}});
        if (membership.position === "manager") {
            await this.update(membership.index, {position : "normal", promotedDate : null});
            return true;
        }
        return false;
    }

    async setAsManager(userid : string) {
        const chatuser = await this.findOne({member : {userid : userid}});
        if (chatuser.position === "normal") {
            await this.update(chatuser.index, {position: "manager", promotedDate : new Date()});
            return true;
        }
        return false;
    }

    async deleteChatUser(userid : string, chatid: string) {
        const repo_chatRoom = getCustomRepository(ChatRoomRepository);
        const chatroom = await repo_chatRoom.findOne({chatid: chatid});
        let deleteuser = await this.findOne({chatroom:{chatid: chatid}, member: {userid: userid}});
        await this.delete(deleteuser.index);
        await repo_chatRoom.update(chatid, {memberCount: chatroom.memberCount - 1})
    }

    async getNewOwner(chatid : string) {
        const managers = this.find({
            where : {chatroom : {chatid : chatid}, position : "manager"},
            order : {promotedDate : "ASC"}
        });
        return managers[0];
    } 
}