import { useEffect, useState } from "react"
import {useHistory} from "react-router-dom"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { socket } from "../../socket/socket"
import {gameRoomDetail, playRoom, score} from "../../types/gameTypes"
import { RootState } from "../../redux/rootReducer"
import { initialize } from "../../redux/userReducer"
import { updateScore } from "../../redux/gameReducer"
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
	
	useEffect(()=>{
		// console.log("menu play");
		socket.on("score", (data:score)=>{
			console.log("score");
			console.log(data);
			s1[1](data.left);
			s2[1](data.right);
			dispatch(updateScore(data));
		})
		return ()=>{ socket.off("score"); }
	}, [s1, s2, dispatch]);

	const handleEixt = () => {
		socket.emit("exitGameRoom", { roomid: gameroom.roomid });
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
		if (gameroom && gameroom.observer && gameroom.observer.length > idx){
			return profileBox(gameroom.observer[idx].userid, Profile(gameroom.observer[idx].profile), gameroom.observer[idx].nickname, false);
		}
		return <div id="observer"></div>;
	}
	
	return (
		<div className="container m-0 p-1" id="menuPlay">
			<div className="col h-100">
				<div className="row m-0 justify-content-center">
					<img src={Profile(playroom.left ? playroom.left.profile : 0)} alt="player1" id="player1"/>
					<label className="h5 m-0">{playroom.left ? playroom.left.nickname : "unknown"}</label>
				</div>
				<div className="row h3 m-2 justify-content-center">VS</div>
				<div className="row m-0 justify-content-center">
					<img src={Profile(playroom.right ? playroom.right.profile : 0)} alt="player2" id="player2"/>
					<label className="h5 m-0">{playroom.right ? playroom.right.nickname : "unknown"}</label>
				</div>
				<label className="row mx-3 my-2 h3" id="menuScore">{playroom ? playroom.score : 0}</label>
				<div className="row h1" id="winLose">{s1} : {s2}</div>
				<div className="row mt-5 mx-1">
					<div className="col mx-1">{observerProfileBox(0)}</div>
					<div className="col mx-1">{observerProfileBox(1)}</div>
					<div className="col mx-1">{observerProfileBox(2)}</div>
				</div>
				<div className="row mt-4 mb-3 mx-3">
					<div className="col mx-3">{observerProfileBox(3)}</div>
					<div className="col mx-3">{observerProfileBox(4)}</div>
				</div>
				<button className="row btn btn-lg my-2" id="exitButton" onClick={handleEixt}>나가기</button>
			</div>
		</div>
	);
}