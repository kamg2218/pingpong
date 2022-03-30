import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom"
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
import { User } from "../../types/userTypes";
import { gameRoomDetail } from "../../types/gameTypes"
import { RootState } from "../../redux/rootReducer";
import { gameRoomInitialState, updateGameRoom } from "../../redux/gameReducer";
import ProfileModal from "../../components/modals/ProfileModal";
import "./waitingRoom.css"
import Profile from "../../icons/Profile";

export default function WaitingRoom(){
	const history = useHistory();
	const param:any = useParams();
	const dispatch = useDispatch();
	const user:User = useSelector((state:RootState)=>state.userReducer.user);
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const [clicked, setClicked] = useState<string>("");
	const [room, setRoom] = useState<gameRoomDetail>(gameroom);

	useEffect(()=>{
		console.log("waitingRoom");
		if (param.id && param.id !== room.roomid){
			socket.emit("exitGameRoom", {roomid: room.roomid});
			dispatch(updateGameRoom(gameRoomInitialState));
			setRoom(gameRoomInitialState);
		}
	}, [dispatch, param.id, room.roomid]);

	const profileBox = (id:string, profile:string, nick:string, player:boolean) => {
		return (
			<div className={`m-1 ${player ? "player" : "observer"}`} id={id} onClick={()=>setClicked(id)} data-toggle="modal" data-target="#profileModal">
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
		dispatch(updateGameRoom(gameRoomInitialState));
		setRoom(gameRoomInitialState);
		history.push("/game");
		//check!!!
		window.location.reload();
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
			<ProfileModal userid={clicked}/>
		</div>
	);
}