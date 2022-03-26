import { useEffect, useContext, useState, useRef } from "react";
import { socket, User, UserContext } from "../../context/userContext";
import {draw, GameContext, gameRoomDetail, GameUser, playRoom} from "../../context/gameContext";
import "./PlayRoom.css"
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { updateDraw, updateGameResult } from "../../redux/gameReducer";

export default function PlayRoom(){
    // const {user} = useContext(UserContext);
    // const {winner, draw, gameroom, playroom} = useContext(GameContext);

    const dispatch = useDispatch();
    const user:User = useSelector((state:RootState) => state.userReducer, shallowEqual);
    const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const playroom:playRoom = useSelector((state:RootState) => state.gameReducer.playroom, shallowEqual);
    const draw:draw = useSelector((state:RootState) => state.gameReducer.draw, shallowEqual);
    const winner:string = useSelector((state:RootState) => state.gameReducer.gameresult, shallowEqual);

    const start = useState<boolean>(true);
    const gameDoing = useRef<null | HTMLElement>(null);
    const canvas = useRef<null | HTMLCanvasElement>(null);

    useEffect(()=>{
        if (start[0] && gameDoing){
            gameDoing.current?.focus();
        }
        socket.on("draw", (data:draw)=>{
            // draw[1](data);
            dispatch(updateDraw(data));
        });
        socket.on("gameResult", (data:any)=>{
            // winner[1](data.winner);
            dispatch(updateGameResult(data.winner));
        })
    }, [draw, start, canvas, winner]);

    function drawCanvas() {
        const ctx = canvas?.current?.getContext("2d");
        if (ctx){
            //clear
            ctx.clearRect(0, 0, draw.background.width, draw.background.height);
            //center
            ctx.beginPath();
            ctx.moveTo(draw.background.width / 2, draw.background.height);
            ctx.lineTo(draw.background.width / 2, 0);
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            if (ctx && winner[0]){ drawWinner(ctx) }
            else{ drawPlay(ctx) }
        }

        return (
            <div className="row p-1" id="canvasBorder">
                <canvas id="canvas" ref={canvas} width={draw.background?.width} height={draw.background?.height}></canvas>
            </div>
        );
    }
    const drawWinner = (ctx: CanvasRenderingContext2D) => {
        const win:string = winner;
        const width:number = draw.background.width / 2;
        const height:number = draw.background.height / 2;
        const player = gameroom.players.find((user:GameUser)=>user.userid === win);

        ctx.textAlign = "center";
        ctx.font = "80px verdana bold";
        ctx.fillStyle = "steelblue";
        if (user.userid === win){ ctx.fillText("WIN", width, height); }
        else if (player){ ctx.fillText("LOSE", width, height); }
        // else { ctx.fillText(player ? player.nickname : "", width, height); }
    }
    const drawPlay = (ctx: CanvasRenderingContext2D) => {
        //ball
        ctx.beginPath();
        ctx.arc(draw.ball.x, draw.ball.y, draw.ball.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fill();
        //left
        const left = draw.left;
        ctx.fillStyle = "blue";
        ctx.fillRect(left.x, left.y, left.width, left.height);
        //right
        const right = draw.right
        ctx.fillStyle = "red";
        ctx.fillRect(right.x, right.y, right.width, right.height);   
    }
    const handleKeyDown = (e:any) => {
        if (e.key === "ArrowDown"){
            console.log('down');
            socket.emit("move", { roomid: playroom.roomid, direction: "down" });
        }else if (e.key === "ArrowUp"){
            console.log('up')
            socket.emit("move", { roomid: playroom.roomid, direction: "up" });
        }
    }
    const handleKeyUp = (e:any) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp"){
            console.log('idle!');
            socket.emit("move", { roomid: playroom.roomid, direction: "idle" })
        }
    }
    return (
        <div className="container my-2 px-3" id="playRoom" onClick={()=>{gameDoing.current?.focus()}}>
            <input className="row-1" id="canvasInput" ref={gameDoing as any} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}></input>
            {draw && drawCanvas()}
        </div>
    );
}