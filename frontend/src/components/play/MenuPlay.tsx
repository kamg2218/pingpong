import { useEffect, useState } from "react"
import {useHistory} from "react-router-dom"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { socket } from "../../socket/socket"
import {gameRoomDetail, playRoom, score, GameUser} from "../../types/gameTypes"
import { RootState } from "../../redux/rootReducer"
import { initialize } from "../../redux/userReducer"
import { updateScore, updateGameRoom } from "../../redux/gameReducer"
import Profile from "../../icons/Profile"
import "./MenuPlay.css";

export default function MenuPlay(){
	const history = useHistory();
	const dispatch = useDispatch();
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const playroom:playRoom = useSelector((state:RootState) => state.gameReducer.playroom, shallowEqual);
	const score:score = useSelector((state:RootState) => state.gameReducer.score, shallowEqual);
	const s1 = useState<number>(score.left ? score.left : 0);
	const s2 = useState<number>(score.right ? score.right : 0);
	const [room, setRoom] = useState<gameRoomDetail>(gameroom);
	
	useEffect(()=>{
		// console.log("menu play");
		socket.on("score", (data:score)=>{
			console.log("score");
			console.log(data);
			s1[1](data.left);
			s2[1](data.right);
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
	}, [s1, s2, dispatch, room]);

	const handleEixt = () => {
		socket.emit("exitGameRoom", { roomid: room.roomid });
		dispatch(initialize());
		history.replace("/game");
		socket.emit("gameRoomList");
	}
	const profileBox = (id:string, profile:string, nick:string, player:boolean) => {
		return (
			<div className="m-1" id={id}>
				<img className="row mx-auto img-fluid img-thumbnail" id="observer" src={profile} alt={id}></img>
				<label className="row justify-content-center">{nick}</label>
			</div>
		);
	}
	const observerProfileBox = (idx:number) => {
		if (room && room.observer && room.observer.length > idx){
			return profileBox(room.observer[idx].userid, Profile(room.observer[idx].profile), room.observer[idx].nickname, false);
		}
		return <div id="observer"></div>;
	}
	
	return (
		<div className="container m-0 p-1" id="menuPlay">
			<div className="col">
				<div className="row m-0 justify-content-center">
					<img src={Profile(playroom.left ? playroom.left.profile : 0)} alt="player1" id="player1"/>
					<label className="h5 m-0">{playroom.left ? playroom.left.nickname : "unknown"}</label>
				</div>
				<div className="row h3 my-4 justify-content-center">VS</div>
				<div className="row m-0 justify-content-center">
					<img src={Profile(playroom.right ? playroom.right.profile : 0)} alt="player2" id="player2"/>
					<label className="h5 m-0">{playroom.right ? playroom.right.nickname : "unknown"}</label>
				</div>
				<label className="row mb-2 mt-4 h3" id="menuScore">{playroom ? playroom.score : 0}</label>
				<div className="row h1" id="winLose">{s1} : {s2}</div>
				<div className="row" id="observerFirst">
					<div className="col" id="observerFirstContent">{observerProfileBox(0)}</div>
					<div className="col" id="observerFirstContent">{observerProfileBox(1)}</div>
					<div className="col" id="observerFirstContent">{observerProfileBox(2)}</div>
				</div>
				<div className="row" id="observerSecond">
					<div className="col" id="observerSecondContent">{observerProfileBox(3)}</div>
					<div className="col" id="observerSecondContent">{observerProfileBox(4)}</div>
				</div>
				<button className="row btn btn-lg my-2" id="exitButton" onClick={handleEixt}>나가기</button>
			</div>
		</div>
	);
}