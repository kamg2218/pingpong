import { Server } from "socket.io";
import { User } from "src/db/entity/User/UserEntity";
import { BlockedFriendsRepository, UserRepository } from "src/db/repository/User/UserCustomRepository";
import { AuthSocket } from "src/type/AuthSocket.interface";
import { getCustomRepository } from "typeorm";
import { onlineManager } from "./onlineManager";

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
        this.members = [];
    }

    public async sayToRoom(socket : AuthSocket, payload : any) {
        const repo_blockList = getCustomRepository(BlockedFriendsRepository);
        const repo_user = getCustomRepository(UserRepository);
        let user = await repo_user.findOne(socket.userid);
        this.members.map(async (socketid) => {
            let theOtherId = onlineManager.userIdOf(socketid);
            console.log(`[saytoRoom] Sent to ${theOtherId}`)
            if (!await repo_blockList.amIBlockedByid(user, theOtherId))
                onlineChatRoom.server.to(socketid).emit("chatMessage", {
                    chatid : payload.chatid,
                    userid : socket.userid,
                    content : payload.content,
                    createdDate : payload.time
                });
        });
    }

    public announceExceptMe(mySocketId : string, event : string, payload : any) {
        console.log("[AEM] members :", this.members);
        this.members.map((socketid)=>{
            if (socketid !== mySocketId)
                onlineChatRoom.server.to(socketid).emit(event, payload);
        });
    }

    public announce(event : string, payload : any) {
        console.log("[AN] members :", this.members);
        this.members.map((socketid)=>{
            let userid = onlineManager.userIdOf(socketid);
            console.log(`[announce] Sent to ${userid}`)
            onlineChatRoom.server.to(socketid).emit(event, payload);
        });
    }

    public join(socketid: string) {
        console.log(`ONline chatroom joined : ${socketid}`);
        if (socketid)
            this.members.push(socketid);
        console.log("now members : ", this.members );
    }

    public leave(socketid : string) {
        if (!socketid)
            return ;
        const index = this.members.indexOf(socketid);
        if (index !== -1)
            this.members.splice(index, 1);
    }
    
}