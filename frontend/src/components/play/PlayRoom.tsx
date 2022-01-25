import { useEffect, useContext, useState, useRef } from "react";
import { socket } from "../../socket/userSocket";
import {draw, GameContext} from "../../socket/gameSocket";

export default function PlayRoom(){
    const gameDoing = useRef<null | HTMLElement>(null);
    const gameContext = useContext(GameContext);
    const start = useState<boolean>(true);
    const [drawState] = useState<draw>(gameContext.draw[0]);
    const canvas = useRef<null | HTMLCanvasElement>(null);

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

    function drawCanvas() {
        let ctx = canvas?.current?.getContext("2d");

        //ball
        if (ctx){
            ctx.beginPath();
            ctx.arc(drawState.ball.x, drawState.ball.y, drawState.ball.z, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "red";
        }

        return (
            <div className="border row h-100 w-100 p-1">
                <canvas id="canvas" ref={canvas} width={drawState?.background?.width} height={drawState?.background?.height}>
                </canvas>
            </div>
        );
    }
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
        <div className="container col h-75 w-100 my-2 px-3" onClick={()=>{gameDoing?.current?.focus()}}>
            <input className="row-1" ref={gameDoing as any} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}></input>
            { drawState && drawCanvas()}
        </div>
    );
}