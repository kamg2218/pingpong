import { useEffect, useState } from "react"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { socket } from "../../socket/socket"
import {gameRoomDetail, playRoom, score, GameUser} from "../../types/gameTypes"
import { RootState } from "../../redux/rootReducer"
import { updateScore, updateGameRoom } from "../../redux/gameReducer"
import ObserverProfileBox from "./ObserverProfileBox"
import Profile from "../../icons/Profile"
import "./MenuPlay.css";

export default function MenuPlay(){
	const dispatch = useDispatch();
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const playroom:playRoom = useSelector((state:RootState) => state.gameReducer.playroom, shallowEqual);
	const score:score = useSelector((state:RootState) => state.gameReducer.score, shallowEqual);
	const [gameScore, setScore] = useState<score>(score);
	const [room, setRoom] = useState<gameRoomDetail>(gameroom);
	
	useEffect(()=>{
		console.log("menu play");
		socket.on("score", (data:score)=>{
			console.log("score");
			console.log(data);
			setScore({...data});
			dispatch(updateScore(data));
		});
		socket.on("changeGameRoom", (msg:any) => {
			const tmp:gameRoomDetail = room;
			console.log("changeGameRoom - in menuPlay");
			console.log(msg);
			if (msg.manager) {tmp.manager = msg.manager;}
			if (msg.title) {tmp.title = msg.title;}
			if (msg.speed) {tmp.speed = msg.speed;}
			if (msg.status) {tmp.status = msg.status;}
			if (msg.type) {tmp.type = msg.type;}
			if (msg.addObserver) {
				const observer:GameUser = msg.addObserver;
				const idx:number = tmp.observer.findIndex((person:GameUser)=>person.userid===observer.userid);
				if (idx === -1){ tmp.observer.push(observer) }
			}
			if (msg.deleteObserver) {
				const observer:GameUser = msg.deleteObserver;
				tmp.observer = tmp.observer?.filter((ob: GameUser) => ob.userid !== observer.userid);
			}
			if (msg.addPlayer) {
				const player:GameUser = msg.addPlayer;
				const idx:number = tmp.players.findIndex((person:GameUser)=>person.userid === player.userid);
				if (idx === -1){ tmp.players.push(player); }
			}
			if (msg.deletePlayer) {
				const player:GameUser = msg.deletePlayer;
				tmp.players = tmp.players?.filter((person: GameUser) => person.userid !== player.userid);
			}
			setRoom({...tmp});
			dispatch(updateGameRoom(tmp));
		});
		return ()=>{
			socket.off("score");
			socket.off("changeGameRoom");
		}
	}, [dispatch, room, gameScore]);

	const handleExit = () => {
		socket.emit("exitGameRoom", { roomid: room.roomid });
	}
	
	return (
		<div className="container" id="menuPlay">
			<div className="col h-100 px-1">
				<div className="row mx-1 mt-3">
					<div className="col-5 m-0 p-0 justify-content-center">
						<img src={Profile(playroom.left ? playroom.left.profile : 0)} alt="player1" id="player1"/>
						<label className="h5 mt-1" id="profileLabel">{playroom.left ? playroom.left.nickname : "unknown"}</label>
					</div>
					<div className="col-2 h3 m-auto p-0">VS</div>
					<div className="col-5 m-0 p-0 justify-content-center">
						<img src={Profile(playroom.right ? playroom.right.profile : 0)} alt="player2" id="player2"/>
						<label className="h5 mt-1" id="profileLabel">{playroom.right ? playroom.right.nickname : "unknown"}</label>
					</div>
				</div>
				<label className="row h2 m-1 my-3" id="menuScore">{playroom ? playroom.score : 0}</label>
				<div className="row h1 m-1" id="winLose">{gameScore.left} : {gameScore.right}</div>
				<div className="row" id="observerFirst">
					<div className="col" id="observerFirstContent"><ObserverProfileBox idx={0} room={room}/></div>
					<div className="col" id="observerFirstContent"><ObserverProfileBox idx={1} room={room}/></div>
					<div className="col" id="observerFirstContent"><ObserverProfileBox idx={2} room={room}/></div>
				</div>
				<div className="row" id="observerSecond">
					<div className="col" id="observerSecondContent"><ObserverProfileBox idx={3} room={room}/></div>
					<div className="col" id="observerSecondContent"><ObserverProfileBox idx={4} room={room}/></div>
				</div>
				<button className="row btn btn-lg" id="exitButton" onClick={handleExit}>나가기</button>
			</div>
		</div>
	);
}