import { Server } from "socket.io";
import { User } from "src/db/entity/User/UserEntity";
import { BlockedFriendsRepository } from "src/db/repository/User/UserCustomRepository";
import { AuthSocket } from "src/type/AuthSocket.interface";
import { getCustomRepository } from "typeorm";

export class onlineChatRoom {
    static server : Server = null;
    private roomid : string; 
    private members : string[];
    
    get id() {
        return this.roomid;
    }

    static init(server : Server) {
        if (!onlineChatRoom.server)
            onlineChatRoom.server = server;
    }

    constructor(roomid : string) {
        this.roomid = roomid;
    }

    public toRoom(user : User, payload : any) {
        const repo_blockList = getCustomRepository(BlockedFriendsRepository);
        this.members.map(async (socketid) => {
            if (!await repo_blockList.amIBlockedByid(user, socketid))
                onlineChatRoom.server.to(socketid).emit("chatMessage", payload);
        });
    }

    public announceExceptMe(socket : AuthSocket, event : string, payload : any) {
        this.members.map(async (socketid)=>{
            if (socketid !== socket.user.userid)
                onlineChatRoom.server.to(socketid).emit(event, payload)
        })
    }

    public join(socket : AuthSocket) {
        this.members.push(socket.id);
    }

    public leave(socket : AuthSocket) {
        const index = this.members.indexOf(socket.id);
        if (index !== -1)
            this.members.splice(index, 1);
    }
    
}