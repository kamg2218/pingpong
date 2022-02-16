import { ChatRoom } from "src/db/entity/Chat/ChatEntity";
import { ChatMembership } from "src/db/entity/Chat/ChatMembership.entity";
import { User } from "src/db/entity/User/UserEntity";
import { EntityRepository, Repository } from "typeorm";


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
            await this.update(membership.index, {position : "normal"});
            return true;
        }
        return false;
    }

    async setAsManager(userid : string) {
        const chatuser = await this.findOne({member : {userid : userid}});
        if (chatuser.position === "normal") {
            await this.update(chatuser.index, {position: "manager"});
            return true;
        }
        return false;
    }
}