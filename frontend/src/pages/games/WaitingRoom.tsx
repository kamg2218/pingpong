import { useEffect, useContext } from "react";
import {useHistory, useParams} from "react-router-dom"
import { socket } from "../../socket/userSocket";
import { GameContext, GameUser } from "../../socket/gameSocket"
import Profile from "../../icons/Profile";
import "./waitingRoom.css"

export default function WaitingRoom(){
	const history = useHistory();
	const param:any = useParams();
	const {gameroom, gameroomlist} = useContext(GameContext);

	useEffect(()=>{
		console.log("waitingRoom");
		console.log(gameroom[0]);
		if (!gameroom[0] && param.id){
			console.log("gameroom is empty!");
			socket.emit("updateGameRoom", {
				roomid: param.id,
			});
		}
		socket.on("changeGameRoom", (msg:any) => {
			const tmp = gameroom[0];
			if (msg.manager) {
				tmp.manager = msg.manager;
			}
			if (msg.title) {
				tmp.title = msg.title;
			}
			if (msg.speed) {
				tmp.speed = msg.speed;
			}
			if (msg.status) {
				tmp.status = msg.status;
			}
			if (msg.type) {
				tmp.type = msg.type;
			}
			if (msg.addObserver) {
				msg.addObserver.map((observer: GameUser) => tmp.oberserver.push(observer))
			}
			if (msg.deleteObserver) {
				msg.deleteObserver.map((observer: GameUser) => tmp.observer = tmp.observer?.filter((ob: GameUser) => ob.userid === observer.userid))
			}
			if (msg.addPlayers) {
				msg.addPlayers.map((player: GameUser) => tmp.players.push(player))
			}
			if (msg.deletePlayers) {
				msg.deletePlayers.map((player: GameUser) => tmp.players = tmp.players?.filter((person: GameUser) => person.userid === player.userid))
			}
			gameroom[1](tmp);
			window.location.reload();
		});

	}, [gameroom]);
	const profileBox = (id:string, profile:string, nick:string, player:boolean) => {
		// console.log("profileBox - " + nick + ", " + player);
		return (
			<div className={`m-1 ${player ? "player":"observer"}`} id={id}>
				<img className="row mx-auto img-fluid img-thumbnail" src={profile} alt={id}></img>
				<label className={`row justify-content-center my-1 ${player ? "h4":"h6"}`}>{nick}</label>
			</div>
		);
	}
	const handleStart = () => {
		socket.emit("startGame", {
			roomid: gameroom[0]?.roomid
		});
	}
	const handleExit = () => {
		if (!gameroom[0] || !gameroom[0].roomid){
			return ;
		}
		socket.emit("exitGameRoom", {
			roomid: gameroom[0]?.roomid
		});
		socket.emit("gameRoomList");
		// gameroomlist[1](undefined);
		history.push("/game");
		// window.location.reload();
	}
	return (
		<div className="container-fluid m-0 p-0 pb-2" id="waitingRoom">
			<div className="row-2 h2" id="waitingRoomTitle">
				{gameroom[0]?.title}
			</div>
			<div className="row-4 px-2 mt-3" id="waitingroombox">
				<div className="col-3 mx-5 px-3" id="waitingRoomProfile">
					{gameroom[0]?.players[0] ? profileBox(gameroom[0]?.players[0].userid, Profile(gameroom[0]?.players[0]?.profile), gameroom[0]?.players[0]?.nickname, true) : ""}
				</div>
				<div className="col-3 mx-5 px-3" id="waitingRoomProfile">
					{gameroom[0]?.players[1] ? profileBox(gameroom[0]?.players[1].userid, Profile(gameroom[0]?.players[1]?.profile), gameroom[0]?.players[1]?.nickname, true): ""}
				</div>
			</div>
			<div className="row-4 px-3 my-5 d-flex">
				<div className="col mx-1" id="waitingRoomObserver">{gameroom[0]?.observer[0] ? profileBox(gameroom[0]?.observer[0].userid, Profile(gameroom[0]?.observer[0].profile), gameroom[0]?.observer[0].nickname, false):""}</div>
				<div className="col mx-1" id="waitingRoomObserver">{gameroom[0]?.observer[1] ? profileBox(gameroom[0]?.observer[1].userid, Profile(gameroom[0]?.observer[1].profile), gameroom[0]?.observer[1].nickname, false):""}</div>
				<div className="col mx-1" id="waitingRoomObserver">{gameroom[0]?.observer[2] ? profileBox(gameroom[0]?.observer[2].userid, Profile(gameroom[0]?.observer[2].profile), gameroom[0]?.observer[2].nickname, false):""}</div>
				<div className="col mx-1" id="waitingRoomObserver">{gameroom[0]?.observer[3] ? profileBox(gameroom[0]?.observer[3].userid, Profile(gameroom[0]?.observer[3].profile), gameroom[0]?.observer[3].nickname, false):""}</div>
				<div className="col mx-1" id="waitingRoomObserver">{gameroom[0]?.observer[4] ? profileBox(gameroom[0]?.observer[4].userid, Profile(gameroom[0]?.observer[4].profile), gameroom[0]?.observer[4].nickname, false):""}</div>
			</div>
			<div className="row mx-3 my-2">
				<button className="col mx-5 my-2 btn" id="waitingRoomBtn" onClick={handleStart} disabled={gameroom[0]?.players.length !== 2}>Start</button>
				<button className="col mx-5 my-2 btn" id="waitingRoomBtn" onClick={handleExit}>Exit</button>
			</div>
		</div>
	);
}