import axios from "axios";
import { useEffect } from "react"
import { Switch, Route, Link, useParams, useHistory } from "react-router-dom"
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
import { gameRoomDetail } from "../../types/gameTypes";
import { chatRoom, ChatData, InputChatRoom, ChatUser } from "../../types/chatTypes"
import { RootState } from "../../redux/rootReducer";
import { updateChat } from "../../redux/chatReducer";
import MenuChat from "../../components/chat/MenuChat"
import ChatRoom from "../../components/chat/ChatRoom"
import "./chat.css";
import { initialize } from "../../redux/userReducer";

type param = {
	id?: String
}

export default function SideMenuChat(){
	const history = useHistory();
	const dispatch = useDispatch();
	// const back_url:string = "http://localhost:4242";
	const back_url:string = "";
	const checkUrl:string = back_url + "/user/check";
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);

	useEffect(()=>{
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
		socket.on("myChatRoom", (data:ChatData)=>{
			console.log("my chat room!!");
			// console.log(data);
			dispatch(updateChat(data));
		});
		socket.on("enterChatRoom", (data:chatRoom)=>{
			console.log("enter chat room!!");
			// console.log(data);
			const tmp:ChatData = chatroom;
			if (tmp.order.indexOf(data.chatid) === -1){
				tmp.order.push(data.chatid);
				tmp.chatroom.push(data);
				dispatch(updateChat(tmp));
			}
		});
		socket.on("updateChatRoom", (data:InputChatRoom)=>{
			console.log("update Chat Room!");
			// console.log(data);
			let tmp:ChatData = chatroom;
			const idx = tmp.order.indexOf(data.chatid);
			if (idx === -1){
				return ;
			}
			if (data.title){ tmp.chatroom[idx].title = data.title; }
			if (data.lock){ tmp.chatroom[idx].lock = data.lock; }
			if (data.type){ tmp.chatroom[idx].type = data.type; }
			if (data.addManager){ data.addManager.map(man=>tmp.chatroom[idx].manager.push(man)); }
			if (data.deleteManager){ data.deleteManager.map(man=>tmp.chatroom[idx].manager = tmp.chatroom[idx].manager.filter((person: string)=> man !== person)); }
			if (data.enterUser){ data.enterUser.map(user=>tmp.chatroom[idx].members.push(user)); }
			if (data.exitUser){ data.exitUser.map(user=>tmp.chatroom[idx].members = tmp.chatroom[idx].members.filter((person:ChatUser)=> user !== person.userid)); }
			dispatch(updateChat(tmp));
		});
	}, [chatroom, checkUrl, gameroom, history]);

	const ChatRoomIdx = () => {
		let idx:param = useParams();
		return <ChatRoom idx={idx.id}></ChatRoom>
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