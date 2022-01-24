import { useEffect, useContext, useState, useRef } from "react";
import { socket } from "../../socket/userSocket";
import {draw, GameContext} from "../../socket/gameSocket";

export default function PlayRoom(){
    const gameDoing = useRef<null | HTMLElement>(null);
    const gameContext = useContext(GameContext);
    const start = useState<boolean>(true);

    useEffect(()=>{
        if (start){
            gameDoing?.current?.focus();
        }
        socket.on("draw", (data:draw)=>{
            gameContext.draw[1](data);
        });
        socket.on("gameResult", (data:any)=>{
            
        })
    }, [gameContext.draw, start]);

    const handleKeyDown = (e:any) => {
        if (e.key === "ArrowDown"){
            console.log('down');
            socket.emit("move", {
                roomid: gameContext.playroom[0].roomid,
                direction: "down"
            })
        }else if (e.key === "ArrowUp"){
            console.log('up')
            socket.emit("move", {
                roomid: gameContext.playroom[0].roomid,
                direction: "up"
            })
        }
    }
    const handleKeyUp = (e:any) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp"){
            console.log('idle!');
            socket.emit("move", {
                roomid: gameContext.playroom[0].roomid,
                direction: "idle"
            })
        }
    }
    return (
        <div onChange={()=>{gameDoing?.current?.focus()}}>
            <input className="" ref={gameDoing as any} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}></input>
        </div>
    );
}