import {io} from "socket.io-client";

const socket = io();

export default function Chat(){
    console.log(socket);
    console.log(window.location);
    
    return (
        <div></div>
    );
}