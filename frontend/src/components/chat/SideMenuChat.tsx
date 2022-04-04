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
import { ChatData, chatRoom, ChatUser, InputChatRoom } from "../../types/chatTypes";
import { updateChat } from "../../redux/chatReducer";

type param = { id?: String }

export default function SideMenuChat(){
	const history = useHistory();
	const dispatch = useDispatch();
	const checkUrl:string = BACK_URL + "/user/check";
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	const [room, setRoom] = useState<ChatData>(chatroom);

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

		socket.on("enterChatRoom", (data:chatRoom)=>{
			console.log("enter chat room!!");
			const tmp:ChatData = room;
			if (tmp.order.indexOf(data.chatid) === -1){
				console.log(tmp.order.indexOf(data.chatid));
				tmp.order.push(data.chatid);
				tmp.chatroom.push(data);
				setRoom(tmp);
				dispatch(updateChat(tmp));
			}
		});
		socket.on("myChatRoom", (data:ChatData)=>{
			console.log("my chat room!!");
			// console.log(data);
			setRoom(data);
			dispatch(updateChat(data));
		});
		socket.on("updateChatRoom", (data:InputChatRoom)=>{
			console.log("update Chat Room!");
			console.log(data, room);
			let tmp:ChatData = room;
			const idx = tmp.order.indexOf(data.chatid);
			if (idx === -1){
				console.log("I'm not there!");
				return ;
			}
			if (data.title){ tmp.chatroom[idx].title = data.title; }
			if (data.lock){ tmp.chatroom[idx].lock = data.lock; }
			if (data.type){ tmp.chatroom[idx].type = data.type; }
			if (data.addManager){ data.addManager.forEach((man:string)=>{
				let index:number = -1;
				index = tmp.chatroom[idx].manager?.findIndex((p:string)=>p === man);
				if (index === -1){ tmp.chatroom[idx].manager.push(man); }
			}); }
			if (data.deleteManager){ data.deleteManager.forEach(man=>tmp.chatroom[idx].manager = tmp.chatroom[idx].manager?.filter((person: string)=> man !== person)); }
			if (data.enterUser){ data.enterUser.forEach((user:ChatUser)=>{
				let index:number = -1;
				index = tmp.chatroom[idx].members.findIndex((p:ChatUser)=>p.userid===user.userid);
				if (index === -1){ tmp.chatroom[idx].members.push(user); }
			}); }
			if (data.exitUser){ data.exitUser.forEach(user=>tmp.chatroom[idx].members = tmp.chatroom[idx].members?.filter((person:ChatUser)=> user !== person.userid)); }
			if (data.switchOwner){ tmp.chatroom[idx].owner = data.switchOwner; }
			setRoom(tmp);
			dispatch(updateChat(tmp));
			console.log(tmp);
		});

	}, [checkUrl, dispatch, gameroom, history, room, room.chatroom]);

	const ChatRoomIdx = () => {
		let idx:param = useParams();
		return <ChatRoom idx={idx.id} room={room}></ChatRoom>
	}
	const handleChat = (data:ChatData) => {
		setRoom(data);
		dispatch(updateChat(data));
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
					<Route path="/game/chat/waiting/:id" render={()=><MenuChat room={room} handleChat={handleChat}></MenuChat>}></Route>
					<Route path="/game/chat/:id" component={ChatRoomIdx}></Route>
					<Route path="/game/chat" render={()=><MenuChat room={room} handleChat={handleChat}></MenuChat>}></Route>
				</Switch>
			</div>
		</div>
	);
}