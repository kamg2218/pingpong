import axios from "axios";
import { useEffect } from "react"
import { Link, useHistory } from "react-router-dom"
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
import { BACK_URL } from "../../types/urlTypes";
import { gameRoomDetail } from "../../types/gameTypes";
import { RootState } from "../../redux/rootReducer";
import { initialize } from "../../redux/userReducer";
import MenuGame from "../../components/games/MenuGame"

export default function SideMenuGame(){
	const history = useHistory();
	const checkUrl:string = BACK_URL + "/user/check";
	const dispatch = useDispatch();
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);

	useEffect(()=>{
		console.log("side menu game here!!");
		axios.get(checkUrl + "?url=sideMenuGame").then((res:any)=>{
			const url:string = history.location.pathname;
  		const idx:number = url.search("wait");

  		if (res.state){
  		  if (res.state === "playing" && gameroom.roomid){
  		    socket.emit("exitGameRoom", { roomid: gameroom.roomid });
					dispatch(initialize());
					history.replace("/game");
  		  }else if (res.state === "waiting" && idx === -1){
  		    socket.emit("exitGameRoom", { roomid: gameroom.roomid });
					dispatch(initialize());
  		  }else if (res.state === "login" && idx !== -1){
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
	}, [checkUrl, dispatch, gameroom, history]);

	const handleClick = () => {
		socket.emit("myChatRoom");
	}

	return (
		<div id="gameTab">
			<div className="row">
				<div className="col-3 btn" id="tab-game-active">
					<Link to={`/game${gameroom.roomid !== "" ? `/waiting/${gameroom.roomid}`: ""}`} className="text-decoration-none text-reset">game</Link>
				</div>
				<div className="col-3 btn" id="tab-chat">
					<Link to={`/game/chat${gameroom.roomid !== "" ? `/waiting/${gameroom.roomid}`: ""}`} className="text-decoration-none text-reset" onClick={handleClick}>chat</Link>
				</div>
			</div>
			<div className="row" id="nav-game"><MenuGame/></div>
		</div>
	);
}