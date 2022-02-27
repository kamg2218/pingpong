import { useState, useEffect, useContext, useRef, JSXElementConstructor } from "react";
import { useHistory } from "react-router-dom"
import {socket, UserContext} from "../../socket/userSocket";
import { ChatContext, ChatBlock, ChatHistory, ChatData } from "../../socket/chatSocket";
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
	const chatid = chatroom[0]?.order[props.idx];
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
			if (data.result){
				console.log(data.result);
				return ;
			}
			console.log("got chat message");
			console.log(data);
			const chat:ChatHistory = history[0];
			chat.list.push(data);
			history[1](chat);
		})
	}, []);

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
			// window.location.reload();
			chatInput.current?.reset();
		});
	}
	const handleInputKeypress = (event:any) => {
		if (event.key === "Enter"){
			handleSendBtn();
		}
	}

	return (
		<div className="container-fluid p-2 h-100" key={`chatroom${props.idx}`}>
			<div className="col">
				<div className="row m-1" onClick={()=>{_history.goBack()}}><i className="bi bi-arrow-left" id="leftArrow"></i></div>
				<div className="row m-0" id="chatlist">
					<div className="col my-1">
						{history[0] && history[0].list && history[0].list.map((data:ChatBlock, idx:number)=>{
							console.log(`idx = ${idx}, data = ${data.content}`);
							if (data.userid === user[0]?.userid)
								return <MyChatBox idx={idx} chatid={chatid} content={data.content}></MyChatBox>
							else
								return <ChatBox idx={idx} chatid={chatid} userid={data.userid} content={data.content}></ChatBox>
						})}
					</div>
				</div>
				<div className="d-flex m-0 p-0" id="chatForm">
					<form ref={chatInput}>
						<input className="col" id="chatInput" onChange={handleInputChange} onKeyPress={handleInputKeypress}></input>
					</form>
					<button className="col-2" id="chatSend" onClick={handleSendBtn}><i className="bi bi-play"/></button>
				</div>
			</div>
		</div>
	);
}