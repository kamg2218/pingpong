import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom"
import { socket } from "../../socket/socket";
import axios from "axios";
import { BACK_URL } from "../../types/urlTypes";
import { User } from "../../types/userTypes";
import { gameRoomDetail, GameUser } from "../../types/gameTypes"
import { updateGameRoom, updatePlayRoom } from "../../redux/gameReducer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import "./WaitingRoom.css"
import Profile from "../../icons/Profile";

export default function WaitingRoom(){
	const history = useHistory();
	const param:any = useParams();
	const dispatch = useDispatch();
	const user:User = useSelector((state:RootState)=>state.userReducer.user);
	const gameroom:gameRoomDetail = useSelector((state:RootState)=>state.gameReducer.gameroom);
	const [room, setRoom] = useState<gameRoomDetail>(gameroom);
	const checkUrl:string = BACK_URL + "/user/check";

	useEffect(()=>{
		console.log("waitingRoom");
		axios.get(checkUrl + "?url=waitingroom").then((res:any)=>{
			console.log("----->", res.state);
  		if (res.state){
				console.log(param.id, room.roomid);
				console.log(param.id === room.roomid);
  		  if (res.state === "playing" && gameroom.roomid){
  		    socket.emit("exitGameRoom", { roomid: gameroom.roomid });
  		  }else if (res.state === "waiting" && param.id !== room.roomid){
  		    socket.emit("exitGameRoom", { roomid: gameroom.roomid });
  		  }else if (res.state === "login"){
					dispatch(initialize());
					history.replace("/game");
  		  }else if (res.state === "logout"){
  		    history.replace("/");
  		  }
  		}
		}).catch((err)=>{
			console.log(err);
			history.replace("/");
		});
		socket.on("changeGameRoom", (msg:any) => {
			const tmp:gameRoomDetail = room;
			console.log("changeGameRoom");
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
		socket.on("startGame", (msg:any) => {
			console.log("start game!");
			console.log(msg);
			if (msg.result) {
				alert("failed to play the game!");
			} else {
				dispatch(updatePlayRoom(msg));
				history.push(`/game/play/${msg.roomid}`);
			}
		});
		return ()=>{
			socket.off("changeGameRoom");
			socket.off("startGame");
		}
	}, [dispatch, gameroom, room, history, param]);

	const profileBox = (id:string, profile:string, nick:string, player:boolean) => {
		const handleProfileClick = () => {
			socket.emit("opponentProfile", { userid: id });
		}
		return (
			<div className={`m-1 ${player ? "player" : "observer"}`} id={id} onClick={handleProfileClick} data-toggle="modal" data-target="#profileModal">
				<img className="row mx-auto img-fluid img-thumbnail" src={profile} alt={id}></img>
				<label className={`row justify-content-center my-1 ${player ? "h4" : "h6"}`}>{nick}</label>
			</div>
		);
	}
	const checkStartButton = () => {
		if (room.manager !== user.userid){
			return true;
		}else if (room.players.length !== 2){
			return true;
		}
		return false;
	}
	const handleStart = () => { socket.emit("startGame", { roomid: room.roomid }); }
	const handleExit = () => {
		if (!room || !room.roomid){
			return ;
		}
		socket.emit("exitGameRoom", { roomid: room.roomid });
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
				<button className="col mx-5 my-2 btn" id="waitingRoomBtn" onClick={handleStart} disabled={checkStartButton()}>Start</button>
				<button className="col mx-5 my-2 btn" id="waitingRoomBtn" onClick={handleExit}>Exit</button>
			</div>
		</div>
	);
}