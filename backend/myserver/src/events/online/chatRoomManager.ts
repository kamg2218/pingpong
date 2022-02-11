
import { ChatRoom } from "./chatRoom";

const chatRooms : ChatRoom[] = [];

export const chatRoomManager = {

    getRoomByid(roomid : string) {
        const res = chatRooms.find(room=>room.id === roomid);
        return res;
    },

    create(roomid : string) {
        const newRoom = new ChatRoom(roomid);
        chatRooms.push(newRoom);
        return newRoom;
    },

    delete(roomid : string) {
        delete chatRooms[roomid];
    }
}
