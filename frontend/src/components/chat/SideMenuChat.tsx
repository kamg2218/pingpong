import "./chat.css";
import MenuChat from "../../components/chat/MenuChat"
import ChatRoom from "../../components/chat/ChatRoom"
import { Switch, Route, Link, useParams, useHistory } from "react-router-dom"
import {useEffect, useContext} from "react"
import { socket } from "../../context/userContext";
import { GameContext } from "../../context/gameContext";
import {ChatContext, chatRoom, ChatData, InputChatRoom, User} from "../../context/chatContext"
import axios from "axios";

type param = {
	id?: String
}

export default function SideMenuChat(){
	const history = useHistory();
	const {chatroom} = useContext(ChatContext);
	const {gameroom} = useContext(GameContext);
	// const back_url:string = "http://localhost:4242";
	const back_url:string = "";
	const checkUrl:string = back_url + "/user/check";
	
	useEffect(()=>{
		console.log(checkUrl);
		axios.get(checkUrl + "?url=sideMenuChat").then((res:any)=>{
			if (res.state){
				console.log(res.state, gameroom[0].roomid);
				if (res.state === "play" && gameroom[0].roomid){
					socket.emit("exitGameRoom", {
						roomid: gameroom[0].roomid,
					});
				}else if (res.state === "logout"){
					history.replace("/");
				}
			}
		}).catch((err)=>{
			console.log(err);
			history.replace("/");
		});
		// if (!chatroom){
		// 	console.log("my chat room!!");
		// 	socket.emit("myChatRoom");
		// }
		socket.on("myChatRoom", (data:ChatData)=>{
			console.log("my chat room!!");
			console.log(data);
			chatroom[1](data);
		});
		socket.on("enterChatRoom", (data:chatRoom)=>{
			console.log(data);
			const tmp:ChatData = chatroom[0];
			console.log(tmp);
			// if (!tmp){
			// 	let list:ChatData = {
			// 		order: [],
			// 		chatroom: [],
			// 	};
			// 	list.order.push(data.chatid);
			// 	list.chatroom.push(data);
			// 	chatContext.chatroom[1](list);
			// 	console.log(list);
			// }else 
			if (tmp && tmp.order.indexOf(data.chatid) === -1){
				tmp.order.push(data.chatid);
				tmp.chatroom.push(data);
				chatroom[1](tmp);
				console.log(tmp);
			}
			// window.location.reload();
		});
		socket.on("updateChatRoom", (data:InputChatRoom)=>{
			console.log("update Chat Room!");
			console.log(data);
			let tmp:ChatData = chatroom[0];
			console.log(tmp);
			console.log(`data = `, data);
			const idx = tmp?.order.indexOf(data.chatid);
			console.log(`idx = ${idx}`);
			if (data.title){
				tmp.chatroom[idx].title = data.title;
			}
			if (data.lock){
				tmp.chatroom[idx].lock = data.lock;
			}
			if (data.type){
				tmp.chatroom[idx].type = data.type;
			}
			if (data.addManager){
				data.addManager.map(man=>tmp.chatroom[idx].manager.push(man));
			}
			if (data.deleteManager){
				data.deleteManager.map(man=>tmp.chatroom[idx].manager = tmp.chatroom[idx].manager.filter((person: string)=> man !== person));
			}
			if (data.enterUser){
				console.log("Enter User");
				data.enterUser.map(user=>tmp.chatroom[idx].members.push(user));
			}
			if (data.exitUser){
				data.exitUser.map(user=>tmp.chatroom[idx].members = tmp.chatroom[idx].members.filter((person: User)=> user !== person.userid));
			}
			chatroom[1](tmp);
		});
		// window.location.reload();
	}, [chatroom, checkUrl, gameroom, history]);

	const ChatRoomIdx = () => {
		let idx:param = useParams();
		return <ChatRoom idx={idx.id}></ChatRoom>
	}

	return (
		<div id="chatTab">
			<div className="row">
				<div className="col-3 btn" id="tab-game">
					<Link to={`/game${gameroom[0] ? `/waiting/${gameroom[0].roomid}`: ""}`} className="text-decoration-none text-reset">game</Link>
				</div>
				<div className="col-3 btn" id="tab-chat-active">
					<Link to={`/game/chat${gameroom[0] ? `/waiting/${gameroom[0].roomid}`: ""}`} className="text-decoration-none text-reset">chat</Link>
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