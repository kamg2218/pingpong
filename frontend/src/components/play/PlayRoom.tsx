import { useEffect, useState, useRef } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
import { User } from "../../types/userTypes";
import { draw, gameRoomDetail, GameUser, playRoom } from "../../types/gameTypes";
import { RootState } from "../../redux/rootReducer";
import { updateDraw, updateGameResult } from "../../redux/gameReducer";
import "./PlayRoom.css"

export default function PlayRoom() {
	const dispatch = useDispatch();
	const user: User = useSelector((state: RootState) => state.userReducer.user, shallowEqual);
	const gameroom: gameRoomDetail = useSelector((state: RootState) => state.gameReducer.gameroom, shallowEqual);
	const playroom: playRoom = useSelector((state: RootState) => state.gameReducer.playroom, shallowEqual);
	const draw: draw = useSelector((state: RootState) => state.gameReducer.draw, shallowEqual);
	const winner: string = useSelector((state: RootState) => state.gameReducer.gameresult, shallowEqual);

	const start = useState<boolean>(true);
	const gameDoing = useRef<null | HTMLElement>(null);
	const canvas = useRef<null | HTMLCanvasElement>(null);
	const [drawState, setDraw] = useState<draw>(draw);
	const [win, setWinner] = useState<string>(winner);
	// const [room, setRoom] = useState<gameRoomDetail>(gameroom);

	useEffect(() => {
		console.log("PlayRoom");
		if (start[0] && gameDoing) { gameDoing.current?.focus(); }
		socket.on("draw", (data: draw) => {
			dispatch(updateDraw(data));
			setDraw(data);
		});
		socket.on("gameResult", (data: any) => {
			dispatch(updateGameResult(data.winner));
			setWinner(data.winner);
		});
	}, [drawState, start, canvas, win]);

	const drawCanvas = () => {
		const ctx = canvas?.current?.getContext("2d");
		if (ctx) {
			//clear
			ctx.clearRect(0, 0, drawState.background.width, drawState.background.height);
			//center
			ctx.beginPath();
			ctx.moveTo(drawState.background.width / 2, drawState.background.height);
			ctx.lineTo(drawState.background.width / 2, 0);
			ctx.lineWidth = 0.5;
			ctx.stroke();

			if (ctx && win[0]) { drawWinner(ctx) }
			else { drawPlay(ctx) }
		}

		return (
			<div className="row p-1" id="canvasBorder">
				<canvas id="canvas" ref={canvas} width={drawState.background?.width} height={drawState.background?.height}></canvas>
			</div>
		);
	}
	const drawWinner = (ctx: CanvasRenderingContext2D) => {
		const width: number = drawState.background?.width / 2;
		const height: number = drawState.background?.height / 2;
		// const player:GameUser | undefined = gameroom.players.find((user: GameUser) => user.userid === win);

		ctx.textAlign = "center";
		ctx.font = "80px verdana bold";
		ctx.fillStyle = "steelblue";
		if (user.userid === win) { ctx.fillText("WIN", width, height); }
		else if (gameroom.isPlayer) { ctx.fillText("LOSE", width, height); }
		else { ctx.fillText(win === gameroom.players[0].userid ? gameroom.players[0].nickname:gameroom.players[1].nickname, width, height); }
	}
	const drawPlay = (ctx: CanvasRenderingContext2D) => {
		//ball
		ctx.beginPath();
		ctx.arc(drawState.ball?.x, drawState.ball?.y, drawState.ball?.r, 0, Math.PI * 2);
		ctx.stroke();
		ctx.fillStyle = "black";
		ctx.fill();
		//left
		const left = drawState.left;
		ctx.fillStyle = "blue";
		ctx.fillRect(left.x, left.y, left.width, left.height);
		//right
		const right = drawState.right
		ctx.fillStyle = "red";
		ctx.fillRect(right.x, right.y, right.width, right.height);
	}
	const handleKeyDown = (e: any) => {
		if (e.key === "ArrowDown") {
			socket.emit("move", { roomid: playroom.roomid, direction: "down" });
		} else if (e.key === "ArrowUp") {
			socket.emit("move", { roomid: playroom.roomid, direction: "up" });
		}
	}
	const handleKeyUp = (e: any) => {
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			socket.emit("move", { roomid: playroom.roomid, direction: "idle" })
		}
	}
	return (
		<div className="container my-2 px-3" id="playRoom" onClick={() => { gameDoing.current?.focus() }}>
			<input className="row-1" id="canvasInput" ref={gameDoing as any} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}></input>
			{drawState && drawCanvas()}
		</div>
	);
}