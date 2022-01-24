import { useEffect, useState, useContext } from 'react';
import {useHistory} from 'react-router-dom'
import Profile from '../../icons/Profile';
import { gameRoomDetail, GameContext } from '../../socket/gameSocket'
import { socket } from '../../socket/userSocket';
import './waitingRoom.css'

export default function WaitingRoom(){
	const history = useHistory();
	const gameContext = useContext(GameContext);
	const [gameRoom] = useState<gameRoomDetail>(gameContext.gameroom[0]);

	useEffect(()=>{
		console.log('useEffect');
	}, [gameRoom]);
	const profileBox = (id:string, profile:string, nick:string, player:boolean) => {
		return (
			<div className={`m-1 ${player ? 'player':'observer'}`} id={id}>
				<img className="row mx-auto img-fluid img-thumbnail" src={profile} alt={id}></img>
				<label className={`row justify-content-center my-1 ${player ? 'h4':'h6'}`}>{nick}</label>
			</div>
		);
	}
	const handleStart = () => {
		socket.emit("startGame", {
			roomid: gameRoom?.roomid
		});
	}
	const handleExit = () => {
		socket.emit("exitGameRoom", {
			roomid: gameRoom?.roomid
		});
		history.push('/game');
	}
	return (
		<div className="container-fluid m-0 mt-4 p-0 pb-2 bg-secondary bg-gradient">
			<div className="row-2 bg-light h2 text-dark d-flex justify-content-center" id="waitingroomtitle">
				{gameRoom?.title}
			</div>
			<div className="row-4 px-2 mt-5 mb-2 d-flex justify-content-center" id="waitingroombox">
				<div className="col-3 mx-5 px-3 bg-light border">
					{profileBox(gameRoom?.players[0].userid, Profile(gameRoom?.players[0].profile), gameRoom?.players[0].nickname, true)}
				</div>
				<div className="col-3 mx-5 px-3 bg-light border">
					{!gameRoom?.players[1] ?? profileBox(gameRoom?.players[1].userid, Profile(gameRoom?.players[1].profile), gameRoom?.players[1].nickname, true)}
				</div>
			</div>
			<div className="row-4 px-3 my-5 d-flex" id="waitingroomobserver">
				<div className="col mx-1 border">{gameRoom?.observer[0] ? profileBox(gameRoom?.observer[0].userid, Profile(gameRoom?.observer[0].profile), gameRoom?.observer[0].nickname, false):''}</div>
				<div className="col mx-1 border">{gameRoom?.observer[1] ? profileBox(gameRoom?.observer[1].userid, Profile(gameRoom?.observer[1].profile), gameRoom?.observer[1].nickname, false):''}</div>
				<div className="col mx-1 border">{gameRoom?.observer[2] ? profileBox(gameRoom?.observer[2].userid, Profile(gameRoom?.observer[2].profile), gameRoom?.observer[2].nickname, false):''}</div>
				<div className="col mx-1 border">{gameRoom?.observer[3] ? profileBox(gameRoom?.observer[3].userid, Profile(gameRoom?.observer[3].profile), gameRoom?.observer[3].nickname, false):''}</div>
				<div className="col mx-1 border">{gameRoom?.observer[4] ? profileBox(gameRoom?.observer[4].userid, Profile(gameRoom?.observer[4].profile), gameRoom?.observer[4].nickname, false):''}</div>
			</div>
			<div className="row mx-3 my-2" id="waitingroombtn">
				<button className="col mx-5 my-2 btn btn-outline-dark" onClick={handleStart}>Start</button>
				<button className="col mx-5 my-2 btn btn-outline-dark" onClick={handleExit}>Exit</button>
			</div>
		</div>
	);
}