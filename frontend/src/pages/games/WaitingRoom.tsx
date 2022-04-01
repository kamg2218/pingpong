import { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom"
import { socket } from "../../socket/socket";
import { User } from "../../types/userTypes";
import { gameRoomDetail } from "../../types/gameTypes"
import { gameRoomInitialState } from "../../redux/gameReducer";
import "./waitingRoom.css"
import Profile from "../../icons/Profile";

export default function WaitingRoom(props:any){
	const history = useHistory();
	const param:any = useParams();
	const user:User = props.user;
	const gameroom:gameRoomDetail = props.gameroom;

	useEffect(()=>{
		console.log("waitingRoom");
		if (param.id && param.id !== gameroom.roomid){
			socket.emit("exitGameRoom", {roomid: gameroom.roomid});
			props.handleGameRoom(gameRoomInitialState);
			history.push("/game");
			window.location.reload();
		}
	}, [gameroom.roomid, history, param.id, props]);

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
		if (gameroom.manager !== user.userid){
			return true;
		}else if (gameroom.players.length !== 2){
			return true;
		}
		return false;
	}
	const handleStart = () => { socket.emit("startGame", { roomid: gameroom.roomid }); }
	const handleExit = () => {
		if (!gameroom || !gameroom.roomid){
			return ;
		}
		socket.emit("exitGameRoom", { roomid: gameroom.roomid });
		props.handleGameRoom(gameRoomInitialState);
		socket.emit("gameRoomList");
		history.push("/game");
		window.location.reload();
	}

	return (
		<div className="container" id="waitingRoom">
			<div className="row-2 h2" id="waitingRoomTitle">{gameroom.title}</div>
			<div className="row-4 px-2 mt-3" id="waitingroombox">
				<div className="col-3 mx-5 px-3" id="waitingRoomProfile">
					{gameroom.players[0] ? profileBox(gameroom.players[0].userid, Profile(gameroom.players[0]?.profile), gameroom.players[0]?.nickname, true) : ""}
				</div>
				<div className="col-3 mx-5 px-3" id="waitingRoomProfile">
					{gameroom.players[1] ? profileBox(gameroom.players[1].userid, Profile(gameroom.players[1]?.profile), gameroom.players[1]?.nickname, true): ""}
				</div>
			</div>
			<div className="row-4 px-3 my-5 d-flex">
				<div className="col mx-1" id="waitingRoomObserver">{gameroom.observer[0] ? profileBox(gameroom.observer[0].userid, Profile(gameroom.observer[0].profile), gameroom.observer[0].nickname, false):""}</div>
				<div className="col mx-1" id="waitingRoomObserver">{gameroom.observer[1] ? profileBox(gameroom.observer[1].userid, Profile(gameroom.observer[1].profile), gameroom.observer[1].nickname, false):""}</div>
				<div className="col mx-1" id="waitingRoomObserver">{gameroom.observer[2] ? profileBox(gameroom.observer[2].userid, Profile(gameroom.observer[2].profile), gameroom.observer[2].nickname, false):""}</div>
				<div className="col mx-1" id="waitingRoomObserver">{gameroom.observer[3] ? profileBox(gameroom.observer[3].userid, Profile(gameroom.observer[3].profile), gameroom.observer[3].nickname, false):""}</div>
				<div className="col mx-1" id="waitingRoomObserver">{gameroom.observer[4] ? profileBox(gameroom.observer[4].userid, Profile(gameroom.observer[4].profile), gameroom.observer[4].nickname, false):""}</div>
			</div>
			<div className="row mx-3 my-2" id="waitingRoomBtns">
				<button className="col mx-5 my-2 btn" id="waitingRoomBtn" onClick={handleStart} disabled={checkStartButton()}>Start</button>
				<button className="col mx-5 my-2 btn" id="waitingRoomBtn" onClick={handleExit}>Exit</button>
			</div>
		</div>
	);
}