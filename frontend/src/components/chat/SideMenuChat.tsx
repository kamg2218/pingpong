import "./chat.css";
import MenuChat from "../../components/chat/MenuChat"
import ChatRoom from "../../components/chat/ChatRoom"
import { Switch, Route, Link, useParams } from "react-router-dom"
import {useEffect, useContext} from "react"
import { socket } from "../../socket/userSocket";
import { GameContext } from "../../socket/gameSocket";
import {ChatContext, chatRoom, ChatData, InputChatRoom, User} from "../../socket/chatSocket"

type param = {
	id?: String
}

export default function SideMenuChat(){
	const chatContext = useContext(ChatContext);
	const gameContext = useContext(GameContext);
	
	useEffect(()=>{
		// console.log("side menu chat");
		// console.log(chatContext.chatroom[0]);
		// if (!chatContext.chatroom[0])
		// 	socket.emit("myChatRoom");
	}, [chatContext]);

	function ChatRoomIdx(){
		let idx:param = useParams();
		return <ChatRoom idx={idx.id}></ChatRoom>
	}
	socket.on("myChatRoom", (data:ChatData)=>{
		console.log("my chat room!!");
		chatContext.chatroom[1](data);
		// setInfo(data);
	});
	socket.on("publicChatRoom", (data:ChatData)=>{
		console.log("public chat room");
		chatContext.publicroom[1](data);
	});
	socket.on("enterChatRoom", (data:chatRoom)=>{
		const tmp:ChatData = chatContext.chatroom[0];
		tmp.order.push(data.chatid);
		tmp.chatroom.push(data);
		chatContext.chatroom[1](tmp);
	});
	socket.on("updateChatRoom", (data:InputChatRoom)=>{
		const idx = chatContext.chatroom[0].order.indexOf(data.chatid);
		if (data.title)
			chatContext.chatroom[0].chatroom[idx].title = data.title;
		if (data.lock)
			chatContext.chatroom[0].chatroom[idx].lock = data.lock;
		if (data.type)
			chatContext.chatroom[0].chatroom[idx].type = data.type;
		if (data.addManager)
			data.addManager.map(man=>chatContext.chatroom[0].chatroom[idx].manager.push(man));
		if (data.deleteManager)
			data.deleteManager.map(man=>chatContext.chatroom[0].chatroom[idx].manager.filter((person: string)=> man !== person));
		if (data.enterUser)
			data.enterUser.map(user=>chatContext.chatroom[0].chatroom[idx].members.push(user));
		if (data.exitUser)
			data.exitUser.map(user=>chatContext.chatroom[0].chatroom[idx].members.filter((person: User)=> user !== person.userid));
	});

	return (
		<div id="chatTab">
			<div className="row">
				<div className="col-3 btn" id="tab-game">
					<Link to={`/game${gameContext.gameroom[0] ? `/waiting/${gameContext.gameroom[0].roomid}`: ""}`} className="text-decoration-none text-reset">game</Link>
				</div>
				<div className="col-3 btn" id="tab-chat-active">
					<Link to={`/game/chat${gameContext.gameroom[0] ? `/waiting/${gameContext.gameroom[0].roomid}`: ""}`} className="text-decoration-none text-reset">chat</Link>
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