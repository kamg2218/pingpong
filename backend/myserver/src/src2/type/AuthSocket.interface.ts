import { Socket } from "socket.io"
import { User } from "src/db/entity/User/User.entity";

export interface AuthSocket extends Socket {
    userid : string,
    historyIndex : number,
}