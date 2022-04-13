import { ChatMembership, ChatRoom } from "src/db/entity/Chat/ChatEntity";
import { EntityRepository, getCustomRepository, getRepository, Repository } from "typeorm";
import { ChatMembershipRepository } from "./ChatCustomRepository";
import { UserRepository } from "../User/UserCustomRepository";
import { User } from "src/db/entity/User/UserEntity";
import dotenv from 'dotenv'
import { ENV_PATH } from "src/config/url";

const ENV = dotenv.config({path : ENV_PATH});

@EntityRepository(ChatRoom)
export class ChatRoomRepository extends Repository<ChatRoom> {

    async updateCount(chatroom : ChatRoom) {
        const repo_membership = getRepository(ChatMembership);
        const count = await repo_membership.count({chatroom : chatroom});
        await this.update({chatid : chatroom.chatid}, { memberCount : count})
    }

    async enterRoom(user : User, chatroom : ChatRoom) {
        const repo_membership = getRepository(ChatMembership)
        await repo_membership.insert({member : user, chatroom : chatroom})
        this.updateCount(chatroom)
    }   
    
    async exitRoom(user : User, chatroom : ChatRoom) {
        const repo_membership = getRepository(ChatMembership)
        await repo_membership.delete({member : user, chatroom : chatroom})
        await this.updateCount(chatroom);
        this.removeRoomIfEmpty(chatroom.chatid);
    }

    async exitRoomById(user : User, chatid : string) {
        const repo_membership = getRepository(ChatMembership);
        const chatroom = await this.findOne(chatid);
        await repo_membership.delete({member : user, chatroom : chatroom})
        await this.updateCount(chatroom);
        await this.removeRoomIfEmpty(chatid);
    }

    async removeRoomIfEmpty(chatid : string){
        const chatroom = await this.findOne(chatid);
        if (chatroom.memberCount == 0)
            this.remove(chatroom);
    }

    createChatRoomInfo(payload : any) {
        const chatRoom = this.create();
        if (payload.title != undefined)
            chatRoom.title = payload.title;
        else
            chatRoom.title = "";
        chatRoom.type = payload.type;
        if (payload.password != undefined)
            chatRoom.password = payload.password;
        else
            chatRoom.password = null;
        chatRoom.memberCount = 0;
        // if (payload.member === undefined)
        //     chatRoom.memberCount = 1;
        // else
        //     chatRoom.memberCount = payload.member.length + 1;
        return chatRoom;
    }

    async getRoomInfo(chatroom : ChatRoom) {
        //check : max env 처리 필요
        const repo_chatMember = getCustomRepository(ChatMembershipRepository);
        const repo_user = getCustomRepository(UserRepository);
        let manager = [];
        let members = [];
        let owner;
        let lock = chatroom.password ? true : false;
        const chatMember = await repo_chatMember.find({chatroom : chatroom});
        chatMember.map(membership=>{
        members.push(repo_user.getSimpleInfo(membership.member));
        if (membership.position === "owner")
            owner = membership.member.userid;
        else if (membership.position === "manager")
            manager.push(membership.member.userid);
        });
        return {
            chatid : chatroom.chatid, 
            title: chatroom.title,
            type: chatroom.type, 
            members, lock, owner, manager,
            max : Number(ENV.parsed.MAXCHATMEMBER),
        };
    }
}