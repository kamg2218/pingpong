import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {socket} from "../../socket/socket";
import { User } from "../../types/userTypes";
import { ChatBlock, ChatHistory, ChatData } from "../../types/chatTypes";
import { RootState } from "../../redux/rootReducer";
import { historyInitalState, updateChat, updateHistory } from "../../redux/chatReducer";
import ChatBox from "./ChatBox";
import MyChatBox from "./MyChatBox";
import "./ChatRoom.css"

//chat 길이 확인!

export default function ChatRoom(props:any){
	const dispatch = useDispatch();
	const _history = useHistory();
	const [chat, setChat] = useState("");
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	const chatid:string = chatroom.order[props.idx];
	const history:ChatHistory = useSelector((state:RootState) => state.chatReducer.history, shallowEqual);
	// const chatInput = useRef<HTMLFormElement>(null);

	useEffect(()=>{
		// if (chatid && (!history || history.chatid !== chatid)){
		// 	console.log("chat history emitted!")
		// 	socket.emit("chatHistory", { chatid: chatid });
		// }
		socket.on("chatHistory", (data:ChatHistory)=>{
			console.log("chatHistroy on!");
			dispatch(updateHistory(data));
		})
		socket.on("chatMessage", (data:any)=>{
			console.log("got chat message");
			if (data.result){
				console.log(data.result);
				return ;
			}
			console.log(data);
			const chat:ChatHistory = history;
			if (chat){
				chat.list.push(data);
				dispatch(updateHistory(chat));
			}
		})
	}, [chatid, history, chat]);

	const handleInputChange = (e :any) => { setChat(e.target.value); }
	const handleSendBtn = () => {
		if (chat === ""){
			return ;
		}
		socket.emit("chatMessage", {
			chatid: chatid,
			contents: chat,
		}, (result:boolean)=>{
			if (result === false){
				alert("mute!!!");
			}
			setChat("");
			// chatInput.current?.reset();
		});
	}
	const handleInputKeypress = (event:any) => {
		if (event.key === "Enter"){
			event.preventDefault();
			handleSendBtn();
		}
	}
	const handleUrl = () => {
		const url:string = _history.location.pathname;
		const idx:number = url.search("waiting");
		
		if (idx !== -1){
			let result:string = url.slice(0, url.search("chat") + 5);
			result += url.slice(idx);
			_history.push(result);
		}else{
			_history.push("/game/chat");
		}
		dispatch(updateHistory(historyInitalState));
	}

	return (
		<div className="container-fluid p-2 h-100" key={`chatroom${props.idx}`}>
			<div className="col h-100">
				<div className="row m-1 mt-2" onClick={handleUrl}><i className="bi bi-arrow-left" id="leftArrow"></i></div>
				<div className="row m-0 mt-3" id="chatlist">
					<div className="col my-1">
						{history && history.list && history.list.map((data:ChatBlock, idx:number)=>{
							console.log(`idx = ${idx}, data = ${data.contents}`);
							if (data.userid === user.userid)
								return <MyChatBox idx={idx} chatid={chatid} data={data}></MyChatBox>
							else
								return <ChatBox idx={idx} chatid={chatid} data={data}></ChatBox>
						})}
					</div>
				</div>
				<div className="row d-flex m-0 mt-1 p-0" id="chatForm">
					<input className="col" id="chatInput" onChange={handleInputChange} onKeyPress={handleInputKeypress}></input>
					<button className="col-2" id="chatSend" onClick={handleSendBtn}><i className="bi bi-play"/></button>
				</div>
			</div>
		</div>
	);
}