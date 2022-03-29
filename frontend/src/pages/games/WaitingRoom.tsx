import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom"
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
import { GameUser, gameRoomDetail } from "../../types/gameTypes"
import { RootState } from "../../redux/rootReducer";
import { gameRoomInitialState, updateGameRoom } from "../../redux/gameReducer";
import "./waitingRoom.css"
import Profile from "../../icons/Profile";

export default function WaitingRoom(){
	const history = useHistory();
	const param:any = useParams();
	const dispatch = useDispatch();
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const [room, setRoom] = useState<gameRoomDetail>(gameroom);

	useEffect(()=>{
		console.log("waitingRoom");
		socket.on("changeGameRoom", (msg:any) => {
			const tmp:gameRoomDetail = room;
			console.log(tmp);
			if (msg.manager) {tmp.manager = msg.manager;}
			if (msg.title) {tmp.title = msg.title;}
			if (msg.speed) {tmp.speed = msg.speed;}
			if (msg.status) {tmp.status = msg.status;}
			if (msg.type) {tmp.type = msg.type;}
			if (msg.addObserver) {msg.addObserver.map((observer: GameUser) => tmp.observer.push(observer))}
			if (msg.deleteObserver) {msg.deleteObserver.map((observer: GameUser) => tmp.observer = tmp.observer?.filter((ob: GameUser) => ob.userid === observer.userid))}
			if (msg.addPlayers) {msg.addPlayers.map((player: GameUser) => tmp.players.push(player))}
			if (msg.deletePlayers) {msg.deletePlayers.map((player: GameUser) => tmp.players = tmp.players?.filter((person: GameUser) => person.userid === player.userid))}
			dispatch(updateGameRoom(tmp));
			setRoom(tmp);
		});

	}, [room, param.id]);

	const profileBox = (id:string, profile:string, nick:string, player:boolean) => {
		return (
			<div className={`m-1 ${player ? "player" : "observer"}`} id={id}>
				<img className="row mx-auto img-fluid img-thumbnail" src={profile} alt={id}></img>
				<label className={`row justify-content-center my-1 ${player ? "h4" : "h6"}`}>{nick}</label>
			</div>
		);
	}
	const handleStart = () => { socket.emit("startGame", { roomid: room.roomid }); }
	const handleExit = () => {
		if (!room || !room.roomid){
			return ;
		}
		socket.emit("exitGameRoom", { roomid: room.roomid });
		socket.emit("gameRoomList");
		dispatch(updateGameRoom(gameRoomInitialState));
		history.push("/game");
	}

	return (
		<div className="container" id="waitingRoom">
			<div className="row-2 h2" id="waitingRoomTitle">{room.title}</div>
			<div className="row-4 px-2 mt-3" id="waitingroombox">
				<div className="col-3 mx-5 px-3" id="waitingRoomProfile">
					{room.players[0] ? profileBox(room.players[0].userid, Profile(room.players[0]?.profile), room.players[0]?.nickname, true) : ""}
				</div>
				<div className="col-3 mx-5 px-3" id="waitingRoomProfile">
					{room.players[1] ? profileBox(room.players[1].userid, Profile(room.players[1]?.profile), room.players[1]?.nickname, true): ""}
				</div>
			</div>
			<div className="row-4 px-3 my-5 d-flex">
				<div className="col mx-1" id="waitingRoomObserver">{room.observer[0] ? profileBox(room.observer[0].userid, Profile(room.observer[0].profile), room.observer[0].nickname, false):""}</div>
				<div className="col mx-1" id="waitingRoomObserver">{room.observer[1] ? profileBox(room.observer[1].userid, Profile(room.observer[1].profile), room.observer[1].nickname, false):""}</div>
				<div className="col mx-1" id="waitingRoomObserver">{room.observer[2] ? profileBox(room.observer[2].userid, Profile(room.observer[2].profile), room.observer[2].nickname, false):""}</div>
				<div className="col mx-1" id="waitingRoomObserver">{room.observer[3] ? profileBox(room.observer[3].userid, Profile(room.observer[3].profile), room.observer[3].nickname, false):""}</div>
				<div className="col mx-1" id="waitingRoomObserver">{room.observer[4] ? profileBox(room.observer[4].userid, Profile(room.observer[4].profile), room.observer[4].nickname, false):""}</div>
			</div>
			<div className="row mx-3 my-2" id="waitingRoomBtns">
				<button className="col mx-5 my-2 btn" id="waitingRoomBtn" onClick={handleStart} disabled={room.players.length !== 2}>Start</button>
				<button className="col mx-5 my-2 btn" id="waitingRoomBtn" onClick={handleExit}>Exit</button>
			</div>
		</div>
	);
}