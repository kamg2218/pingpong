
import { onlineChatRoom } from "./onlineChatRoom";

const chatRooms = {};

export const onlineChatRoomManager = {

    getRoomByid(roomid : string) {
        return chatRooms[roomid];
    },

    create(roomid : string) {
        const newRoom = new onlineChatRoom(roomid);
        chatRooms[roomid] = newRoom;
        return newRoom;
    },

    delete(roomid : string) {
        delete chatRooms[roomid];
    },

    print() {
        console.log("chatRoom > ", chatRooms);
    }
}
