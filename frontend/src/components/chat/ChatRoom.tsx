import { useState, useEffect, useContext, useRef } from "react";
import { useHistory } from "react-router-dom"
import {socket, UserContext} from "../../socket/userSocket";
import { ChatContext, ChatBlock, ChatHistory } from "../../socket/chatSocket";
import ChatBox from "./ChatBox";
import MyChatBox from "./MyChatBox";
import "../../css/ChatRoom.css"

//채팅방 입장 시, 히스토리 업데이트 필요함!
//chatMessage 업데이트 확인 필요!
//chat 길이 확인!

export default function ChatRoom(props:any){
	const _history = useHistory();
	const [chat, setChat] = useState("");
	const {user} = useContext(UserContext);
	const {chatroom, history} = useContext(ChatContext);
	const chatid:string = chatroom[0]?.order[props.idx];
	const chatInput = useRef<HTMLFormElement>(null);

	useEffect(()=>{
		if (chatid && (!history[0] || history[0].chatid !== chatid)){
			console.log("chat history emitted!")
			socket.emit("chatHistory", {
				chatid: chatid,
			});
		}
		socket.on("chatHistory", (data:ChatHistory)=>{
			history[1](data);
		})
		socket.on("chatMessage", (data:any)=>{
			console.log("got chat message");
			if (data.result){
				console.log(data.result);
				return ;
			}
			console.log(data);
			const chat:ChatHistory = history[0];
			chat.list.push(data);
			history[1](chat);
		})
	}, [chat, history]);

	const handleInputChange = (e :any) => {
		setChat(e.target.value);
	}
	const handleSendBtn = () => {
		if (chat === ""){
			return ;
		}
		socket.emit("chatMessage", {
			chatid: chatid,
			content: chat,
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
	}

	return (
		<div className="container-fluid p-2 h-100" key={`chatroom${props.idx}`}>
			<div className="col">
				<div className="row m-1" onClick={handleUrl}><i className="bi bi-arrow-left" id="leftArrow"></i></div>
				<div className="row m-0" id="chatlist">
					<div className="col my-1">
						{history[0] && history[0].list && history[0].list.map((data:ChatBlock, idx:number)=>{
							console.log(`idx = ${idx}, data = ${data.content}`);
							if (data.userid === user[0]?.userid)
								return <MyChatBox idx={idx} chatid={chatid} data={data}></MyChatBox>
							else
								return <ChatBox idx={idx} chatid={chatid} data={data}></ChatBox>
						})}
					</div>
				</div>
				<form className="d-flex m-0 p-0" id="chatForm" ref={chatInput}>
					<input className="col" id="chatInput" onChange={handleInputChange} onKeyPress={handleInputKeypress}></input>
					<button className="col-2" id="chatSend" onClick={handleSendBtn}><i className="bi bi-play"/></button>
				</form>
			</div>
		</div>
	);
}