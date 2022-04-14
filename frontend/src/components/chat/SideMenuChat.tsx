import axios from "axios";
import { useEffect, useState } from "react"
import { Switch, Route, Link, useParams, useHistory } from "react-router-dom"
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
import { BACK_URL } from "../../types/urlTypes";
import { gameRoomDetail } from "../../types/gameTypes";
import { RootState } from "../../redux/rootReducer";
import { initialize } from "../../redux/userReducer";
import MenuChat from "../../components/chat/MenuChat"
import ChatRoom from "../../components/chat/ChatRoom"
import "./chat.css";
import { ChatData } from "../../types/chatTypes";

type param = { id?: String }

export default function SideMenuChat(){
	const history = useHistory();
	const dispatch = useDispatch();
	const checkUrl:string = BACK_URL + "/user/check";
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);

	useEffect(()=>{
		console.log("sideMenuChat");
		const url:string = history.location.pathname;
		const idx:number = url.search("wait");
		
		axios.get(checkUrl + "?url=sideMenuChat").then((res:any)=>{
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

	const ChatRoomIdx = () => {
		let idx:param = useParams();
		return <ChatRoom idx={idx.id ? idx.id.toString():""} room={chatroom}></ChatRoom>
	}

	return (
		<div id="chatTab">
			<div className="row">
				<div className="col-3 btn" id="tab-game">
					<Link to={`/game${gameroom.roomid !== "" ? `/waiting/${gameroom.roomid}`: ""}`} className="text-decoration-none text-reset">game</Link>
				</div>
				<div className="col-3 btn" id="tab-chat-active">
					<Link to={`/game/chat${gameroom.roomid !== "" ? `/waiting/${gameroom.roomid}`: ""}`} className="text-decoration-none text-reset">chat</Link>
				</div>
			</div>
			<div className="row" id="nav-chat">
				<Switch>
					<Route path="/game/chat/waiting/:id" component={MenuChat}></Route>
					<Route path="/game/chat/:id" component={ChatRoomIdx}></Route>
					<Route path="/game/chat" component={MenuChat}></Route>
				</Switch>
			</div>
		</div>
	);
}
