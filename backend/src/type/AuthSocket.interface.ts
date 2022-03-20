import { Socket } from "socket.io"

export interface AuthSocket extends Socket {
    userid : string,
    historyIndex : number
}