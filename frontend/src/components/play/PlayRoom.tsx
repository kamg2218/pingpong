import { useEffect, useContext, useState, useRef } from "react";
import { socket, UserContext } from "../../socket/userSocket";
import {draw, GameContext, GameUser} from "../../socket/gameSocket";
import "./playRoom.css"

export default function PlayRoom(){
    const {user} = useContext(UserContext);
    const {winner, draw, gameroom, playroom} = useContext(GameContext);
    const start = useState<boolean>(true);
    const gameDoing = useRef<null | HTMLElement>(null);
    const canvas = useRef<null | HTMLCanvasElement>(null);

    useEffect(()=>{
        if (start[0] && gameDoing){
            gameDoing.current?.focus();
        }
        socket.on("draw", (data:draw)=>{
            draw[1](data);
        });
        socket.on("gameResult", (data:any)=>{
            winner[1](data.winner);
        })
    }, [draw, start, canvas, draw[0], winner]);

    function drawCanvas() {
        const ctx = canvas?.current?.getContext("2d");

        if (ctx){
            //center
            ctx.beginPath();
            ctx.moveTo(draw[0].background.width / 2, draw[0].background.height);
            ctx.lineTo(draw[0].background.width / 2, 0);
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            if (ctx && winner[0]){
                drawWinner(ctx)
            }else{
                drawPlay(ctx)
            }
        }

        return (
            <div className="row p-1" id="canvasBorder">
                <canvas id="canvas" ref={canvas} width={draw[0]?.background?.width} height={draw[0]?.background?.height}></canvas>
            </div>
        );
    }
    const drawWinner = (ctx: CanvasRenderingContext2D) => {
        const win:string = winner[0];
        const width:number = draw[0].background.width / 2;
        const height:number = draw[0].background.height / 2;
        const player = gameroom[0]?.players.find((user:GameUser)=>user.userid === win);

        ctx.textAlign = "center";
        ctx.font = "80px verdana bold";
        ctx.fillStyle = "steelblue";
        if (user[0]?.id === win){
            ctx.fillText("WIN", width, height);
        }else if (player){
            ctx.fillText("LOSE", width, height);
        }else{
            ctx.fillText(player?.nickname, width, height);
        }
    }
    const drawPlay = (ctx: CanvasRenderingContext2D) => {
        //ball
        ctx.beginPath();
        ctx.arc(draw[0].ball.x, draw[0].ball.y, draw[0].ball.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fill();
        //left
        const left = draw[0].left
        ctx.fillStyle = "blue";
        ctx.fillRect(left.x, left.y, left.width, left.height);
        //right
        const right = draw[0].right
        ctx.fillStyle = "red";
        ctx.fillRect(right.x, right.y, right.width, right.height);   
    }
    const handleKeyDown = (e:any) => {
        if (e.key === "ArrowDown"){
            console.log('down');
            socket.emit("move", {
                roomid: playroom[0]?.roomid,
                direction: "down"
            })
        }else if (e.key === "ArrowUp"){
            console.log('up')
            socket.emit("move", {
                roomid: playroom[0]?.roomid,
                direction: "up"
            })
        }
    }
    const handleKeyUp = (e:any) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp"){
            console.log('idle!');
            socket.emit("move", {
                roomid: playroom[0].roomid,
                direction: "idle"
            })
        }
    }
    return (
        <div className="container my-2 px-3" id="playRoom" onClick={()=>{gameDoing.current?.focus()}}>
            <input className="row-1" id="canvasInput" ref={gameDoing as any} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}></input>
            {draw[0] && drawCanvas()}
        </div>
    );
}