import { Server } from "socket.io";
import { BlockedFriendsRepository, UserRepository } from "src/db/repository/User/UserCustomRepository";
import { AuthSocket } from "src/type/AuthSocket.interface";
import { getCustomRepository } from "typeorm";
import { Emitter } from "../auth/emitter";
import { onlineManager } from "./onlineManager";

export class onlineChatRoom {
    static _server : Server = null;
    private roomid : string;
    private members : string[];
    private emitter;
    private server;
    
    get id() {
        return this.roomid;
    }

    static init(server : Server) {
        if (!onlineChatRoom._server)
            onlineChatRoom._server = server;
    }

    constructor(roomid : string) {
        this.roomid = roomid;
        this.members = [];
        this.server = onlineChatRoom._server;
        this.emitter = new Emitter(this);
    }

    public async sayToRoom(socket : AuthSocket, payload : any) {
        const repo_blockList = getCustomRepository(BlockedFriendsRepository);
        const repo_user = getCustomRepository(UserRepository);
        let user = await repo_user.findOne(socket.userid);
        this.members.map(async (socketid) => {
            let theOtherId = onlineManager.userIdOf(socketid);
            console.log(`[saytoRoom] Sent to ${theOtherId}`)
            if (!await repo_blockList.amIBlockedById(user.userid, theOtherId) && !await repo_blockList.didIBlockId(user.userid, theOtherId))
                this.emitter.emitById(socketid, "chatMessage", {
                    chatid : this.id,
                    userid : socket.userid,
                    contents : payload.contents,
                    createDate : payload.time
                });
        });
    }

    public announceExceptMe(mySocketId : string, event : string, payload : any) {
        console.log("[AEM] members :", this.members);
        this.members.map((socketid)=>{
            if (socketid !== mySocketId)
                this.emitter.emitById(socketid, event, payload);
                // onlineChatRoom.server.to(socketid).emit(event, payload);
        });
    }

    public announce(event : string, payload : any) {
        console.log("[AN] members :", this.members);
        this.members.map((socketid)=>{
            let userid = onlineManager.userIdOf(socketid);
            console.log(`[announce] Sent to ${userid}`);
            this.emitter.emitById(socketid, event, payload);
            // onlineChatRoom.server.to(socketid).emit(event, payload);
        });
    }

    public join(socketid: string) {

        if (socketid)
            this.members.push(socketid);
    }

    public leave(socketid : string) {
        if (!socketid)
            return ;
        const index = this.members.indexOf(socketid);
        if (index !== -1)
            this.members.splice(index, 1);
    }
    
}