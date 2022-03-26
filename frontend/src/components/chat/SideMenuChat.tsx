import "./chat.css";
import MenuChat from "../../components/chat/MenuChat"
import ChatRoom from "../../components/chat/ChatRoom"
import { Switch, Route, Link, useParams, useHistory } from "react-router-dom"
import {useEffect, useContext} from "react"
import { socket } from "../../context/userContext";
import { GameContext, gameRoomDetail } from "../../context/gameContext";
import {ChatContext, chatRoom, ChatData, InputChatRoom, User} from "../../context/chatContext"
import axios from "axios";
import { batch, shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
// import { updateChat } from "../../redux/chatReducer";
import { updateChat } from "../../redux/chatRoomReducer";

type param = {
	id?: String
}

export default function SideMenuChat(){
	const history = useHistory();
	// const {chatroom} = useContext(ChatContext);
	// const {gameroom} = useContext(GameContext);
	// const back_url:string = "http://localhost:4242";
	const back_url:string = "";
	const checkUrl:string = back_url + "/user/check";
	
	const dispatch = useDispatch();
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);

	useEffect(()=>{
		console.log(checkUrl);
		// if (!chatroom){
		// 	console.log("chatroom!!!");
		// 	socket.emit("myChatRoom");
		// }
		axios.get(checkUrl + "?url=sideMenuChat").then((res:any)=>{
			if (res.state){
				console.log(res.state, gameroom.roomid);
				if (res.state === "play" && gameroom.roomid){
					socket.emit("exitGameRoom", { roomid: gameroom.roomid });
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
			console.log(data);
			// chatroom[1](data);
			batch(()=>{ dispatch(updateChat(data)); });
		});
		socket.on("enterChatRoom", (data:chatRoom)=>{
			console.log("enter chat room!!");
			console.log(data);
			const tmp:ChatData = chatroom;
			console.log(tmp);
			if (tmp && tmp.order.indexOf(data.chatid) === -1){
				tmp.order.push(data.chatid);
				tmp.chatroom.push(data);
				// chatroom[1](tmp);
				// dispatch(updateChat(tmp));
				batch(()=>{ dispatch(updateChat(tmp)); });
				console.log("tmp = ", tmp);
			}
			// window.location.reload();
		});
		socket.on("updateChatRoom", (data:InputChatRoom)=>{
			console.log("update Chat Room!");
			console.log(data);
			let tmp:ChatData = chatroom;
			console.log(tmp);
			console.log(`data = `, data);
			const idx = tmp?.order.indexOf(data.chatid);
			console.log(`idx = ${idx}`);
			if (data.title){ tmp.chatroom[idx].title = data.title; }
			if (data.lock){ tmp.chatroom[idx].lock = data.lock; }
			if (data.type){ tmp.chatroom[idx].type = data.type; }
			if (data.addManager){ data.addManager.map(man=>tmp.chatroom[idx].manager.push(man)); }
			if (data.deleteManager){ data.deleteManager.map(man=>tmp.chatroom[idx].manager = tmp.chatroom[idx].manager.filter((person: string)=> man !== person)); }
			if (data.enterUser){ data.enterUser.map(user=>tmp.chatroom[idx].members.push(user)); }
			if (data.exitUser){ data.exitUser.map(user=>tmp.chatroom[idx].members = tmp.chatroom[idx].members.filter((person: User)=> user !== person.userid)); }
			// chatroom[1](tmp);
			// dispatch(updateChat(tmp));
			batch(()=>{ dispatch(updateChat(tmp)); });
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
					<Route path="/game/chat/waiting/:id"><MenuChat/></Route>
					<Route path="/game/chat/:id"><ChatRoomIdx/></Route>
					<Route path="/game/chat"><MenuChat/></Route>
				</Switch>
			</div>
		</div>
	);
}