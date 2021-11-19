import { ChatMemberShip } from "src/db/entity/Chat/ChatMembership.entity";
import { ChatRoom } from "src/db/entity/Chat/ChatRoom.entity";
import { AfterUpdate, EntityRepository, getRepository, Repository } from "typeorm";
import { User } from "src/db/entity/User/User.entity";
import { RoomMode } from "src/type/RoomMode.type";

@EntityRepository(ChatRoom)
export class ChatRoomRepository extends Repository<ChatRoom> {

    async createRoom(title : string, mode : RoomMode) {
        const room = this.create();
        room.title = title;
        room.mode = mode;
        const res = await this.insert(room);
        return (await this.findOne(res.generatedMaps[0]))
    }
    
    async updateCount(chatroom : ChatRoom) {
        const repo_membership = getRepository(ChatMemberShip);
        const count = await repo_membership.count({chatroom : chatroom});
        await this.update({chatid : chatroom.chatid}, { memberCount : count})
    }

    async enterRoom(user : User, chatroom : ChatRoom) {
        const repo_membership = getRepository(ChatMemberShip)
        await repo_membership.insert({userid : user, chatroom : chatroom})
        this.updateCount(chatroom)
    }   
    
    async exitRoom(user : User, chatroom : ChatRoom) {
        const repo_membership = getRepository(ChatMemberShip)
        await repo_membership.delete({userid : user, chatroom : chatroom})
        await this.updateCount(chatroom);
        this.removeRoomIfEmpty(chatroom.chatid);
    }

    async exitRoomById(user : User, chatid : string) {
        const repo_membership = getRepository(ChatMemberShip);
        const chatroom = await this.findOne(chatid);
        await repo_membership.delete({userid : user, chatroom : chatroom})
        await this.updateCount(chatroom);
        await this.removeRoomIfEmpty(chatid);
    }

    async removeRoomIfEmpty(chatid : string){
        const chatroom = await this.findOne(chatid);
        if (chatroom.memberCount == 0)
            this.remove(chatroom);
    }
}