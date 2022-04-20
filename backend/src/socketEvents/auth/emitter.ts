import { AuthSocket } from "src/type/AuthSocket.interface";
import { onlineManager } from "../online/onlineManager";

export function Emitter (caller) {
    this.that = caller;
    
	this.emit = function (socket : AuthSocket, event : string, data : any)  {
		console.log(`Event : ${event}, to ${socket.userid}`);
		console.log(data);
		socket.emit(event, data);
	};

	this.emitById = function (socketid : string, event : string, data : any) {
        if (event !== "draw") {
            let userid = onlineManager.userIdOf(socketid);
            console.log(`Event : ${event}, to ${userid}`);
            console.log(data);
        }
		this.that.server.to(socketid).emit(event, data);
	};
}