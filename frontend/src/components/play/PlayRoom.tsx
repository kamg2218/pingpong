import { useEffect, useContext, useState, useRef } from "react";
import { socket, UserContext } from "../../socket/userSocket";
import {draw, GameContext, GameUser} from "../../socket/gameSocket";
import "./playRoom.css"

export default function PlayRoom(){
    const gameDoing = useRef<null | HTMLElement>(null);
    const gameContext = useContext(GameContext);
    const userContext = useContext(UserContext);
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
            gameContext.winner[1](data.winner);
        })
    }, [gameContext.draw, start, canvas, drawState, gameContext.winner]);

    function drawCanvas() {
        const ctx = canvas?.current?.getContext("2d");

        if (ctx){
            //center
            ctx.beginPath();
            ctx.moveTo(drawState.background.width / 2, drawState.background.height);
            ctx.lineTo(drawState.background.width / 2, 0);
            ctx.lineWidth = 1;
            // ctx.stroke();
            
            if (ctx && gameContext.winner[0]){
                drawWinner(ctx)
            }else{
                drawPlay(ctx)
            }
        }

        return (
            <div className="row p-1" id="canvasBorder">
                <canvas id="canvas" ref={canvas} width={drawState?.background?.width} height={drawState?.background?.height}></canvas>
            </div>
        );
    }
    const drawWinner = (ctx: CanvasRenderingContext2D) => {
        const winner:string = gameContext.winner[0];
        const width:number = drawState.background.width / 2;
        const height:number = drawState.background.height / 2;
        const player = gameContext.gameroom[0]?.players.find((user:GameUser)=>user.userid === winner)

        ctx.textAlign = "center";
        ctx.font = "80px verdana bold";
        ctx.fillStyle = "steelblue";
        if (userContext.user[0]?.id === winner){
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
        ctx.arc(drawState.ball.x, drawState.ball.y, drawState.ball.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fill();
        //left
        const left = drawState.left
        ctx.fillStyle = "blue";
        ctx.fillRect(left.x, left.y, left.width, left.height);
        //right
        const right = drawState.right
        ctx.fillStyle = "red";
        ctx.fillRect(right.x, right.y, right.width, right.height);   
    }
    const handleKeyDown = (e:any) => {
        if (e.key === "ArrowDown"){
            console.log('down');
            socket.emit("move", {
                roomid: gameContext.playroom[0]?.roomid,
                direction: "down"
            })
        }else if (e.key === "ArrowUp"){
            console.log('up')
            socket.emit("move", {
                roomid: gameContext.playroom[0]?.roomid,
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
        <div className="container col my-2 px-3" id="playRoom" onClick={()=>{gameDoing?.current?.focus()}}>
            <input className="row-1" id="canvasInput" ref={gameDoing as any} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}></input>
            {drawState && drawCanvas()}
        </div>
    );
}