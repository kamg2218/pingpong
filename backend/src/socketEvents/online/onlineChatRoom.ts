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
        let theOtherSocketId;
        this.members.map(socketid=>{
            if (socketid !== socket.id)
                theOtherSocketId = socketid;
        });
        let theOtherId = onlineManager.userIdOf(theOtherSocketId);
        if (!await repo_blockList.amIBlockedById(socket.userid, theOtherId) && !await repo_blockList.didIBlockId(socket.userid, theOtherId)) {
            let data = {
                chatid : this.id,
                userid : socket.userid,
                contents : payload.contents,
                createDate : payload.time};
            this.emitter.emitById(theOtherSocketId, "chatMessage", data);
            this.emitter.emit(socket, "chatMessage", data);
        }
        else
            return false;
        return true;
    }

    public announceExceptMe(mySocketId : string, event : string, payload : any) {
        console.log("[AEM] members :", this.members);
        this.members.map((socketid)=>{
            if (socketid !== mySocketId)
                this.emitter.emitById(socketid, event, payload);
        });
    }

    public announce(event : string, payload : any) {
        console.log("[AN] members :", this.members);
        this.members.map((socketid)=>{
            let userid = onlineManager.userIdOf(socketid);
            console.log(`[announce] Sent to ${userid}`);
            this.emitter.emitById(socketid, event, payload);
        });
        return true;
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