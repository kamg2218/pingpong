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
}