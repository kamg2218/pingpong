
import { onlineChatRoom } from "./onlineChatRoom";

const chatRooms : onlineChatRoom[] = [];

export const onlineChatRoomManager = {

    getRoomByid(roomid : string) {
        const res = chatRooms.find(room=>room.id === roomid);
        return res;
    },

    create(roomid : string) {
        const newRoom = new onlineChatRoom(roomid);
        chatRooms.push(newRoom);
        return newRoom;
    },

    delete(roomid : string) {
        delete chatRooms[roomid];
    }
}
