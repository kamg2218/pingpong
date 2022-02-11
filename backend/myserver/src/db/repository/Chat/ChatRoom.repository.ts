import { ChatMembership, ChatRoom } from "src/db/entity/Chat/ChatEntity";
import { AfterUpdate, EntityRepository, getCustomRepository, getRepository, Repository } from "typeorm";
import { User } from "src/db/entity/User/UserEntity";
import { RoomMode } from "src/type/RoomMode.type";
import { ChatMembershipRepository } from "./ChatCustomRepository";

@EntityRepository(ChatRoom)
export class ChatRoomRepository extends Repository<ChatRoom> {
    /*
    async getinfo(chatRoom : ChatRoom, chatid: string) {
        // this.manager, owner, member,
        const chatroom = await this.findOne(chatid);
        // const repo_membership = getCustomRepository(ChatMembershipRepository);
        // repo_membership.findOne({position: "owner"});
        chatroom.membership
        // repo_membership.find({chatid: }, {position: "manager"});

        // repo_membership.find({chatid: }, {position: "normal"});

    }
    */

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
        chatRoom.memberCount = 1;
        // if (payload.member === undefined)
        //     chatRoom.memberCount = 1;
        // else
        //     chatRoom.memberCount = payload.member.length + 1;
        return chatRoom;
    }
}