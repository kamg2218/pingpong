import { useEffect, useState, useContext } from "react"
import {useHistory} from "react-router-dom"
import Profile from "../../icons/Profile"
import {socket} from "../../context/userContext"
import {draw, GameContext, gameRoomDetail, GameUser, playRoom} from "../../context/gameContext"
import "./MenuPlay.css";
import { shallowEqual, useSelector } from "react-redux"
import { RootState } from "../../redux/rootReducer"

export default function MenuPlay(props:any){
	const history = useHistory();
	// const gameContext = useContext(GameContext);
	// const [gameroom] = useState<gameRoomDetail>(gameContext.gameroom[0]);
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const playroom:playRoom = useSelector((state:RootState) => state.gameReducer.playroom, shallowEqual);
	const draw:draw = useSelector((state:RootState) => state.gameReducer.draw, shallowEqual);

	const p1 = gameroom.players.find((p:GameUser)=> p.userid === playroom.player1);
	const p2 = gameroom.players.find((p:GameUser)=> p.userid === playroom.player2);
	const s1 = useState<number>(draw ? draw.left.score : 0);
	const s2 = useState<number>(draw ? draw.right.score : 0);
	
	useEffect(()=>{
		console.log("menu play");
	}, [s1, s2, gameroom]);
	const profileBox = (id:string, profile:string, nick:string, player:boolean) => {
		return (
			<div className="m-1" id={id}>
				<img className="row mx-auto img-fluid img-thumbnail" id="observerImg" src={profile} alt={id}></img>
				<label className="row justify-content-center">{nick}</label>
			</div>
		);
	}
	const handleEixt = () => {
		socket.emit("exitGameRoom", { roomid: gameroom.roomid });
		history.replace("/game");
	}
	return (
		<div className="container m-0 p-1" id="menuPlay">
			<div className="col h-100">
				<div className="row m-0 justify-content-center">
					<img src={Profile(p1 ? p1.profile : 0)} alt="player1" id="player1"/>
					<label className="h5 m-0">{p1 ? p1.nickname : "unknownskejfkss"}</label>
				</div>
				<div className="row h3 m-2 justify-content-center">VS</div>
				<div className="row m-0 justify-content-center">
					<img src={Profile(p2 ? p2.profile : 0)} alt="player2" id="player2"/>
					<label className="h5 m-0">{p2 ? p2.nickname : "unknownskejfkss"}</label>
				</div>
				<label className="row mx-3 my-2 h3" id="menuScore">{playroom ? playroom.score : 0}</label>
				<div className="row h1" id="winLose">{s1} : {s2}</div>
				<div className="row mt-5 mx-1">
					<div className="col mx-1" id="observer">{gameroom?.observer[0] ? profileBox(gameroom.observer[0].userid, Profile(gameroom.observer[0].profile), gameroom.observer[0].nickname, false):""}</div>
					<div className="col mx-1" id="observer">{gameroom?.observer[1] ? profileBox(gameroom.observer[1].userid, Profile(gameroom.observer[1].profile), gameroom.observer[1].nickname, false):""}</div>
					<div className="col mx-1" id="observer">{gameroom?.observer[2] ? profileBox(gameroom.observer[2].userid, Profile(gameroom.observer[2].profile), gameroom.observer[2].nickname, false):""}</div>
				</div>
				<div className="row mt-4 mb-3 mx-3">
					<div className="col mx-3" id="observer">{gameroom?.observer[3] ? profileBox(gameroom.observer[3].userid, Profile(gameroom.observer[3].profile), gameroom.observer[3].nickname, false):""}</div>
					<div className="col mx-3" id="observer">{gameroom?.observer[4] ? profileBox(gameroom.observer[4].userid, Profile(gameroom.observer[4].profile), gameroom.observer[4].nickname, false):""}</div>
				</div>
				<button className="row btn btn-lg my-2" id="exitButton" onClick={handleEixt}>나가기</button>
			</div>
		</div>
	);
}