import { useState, useRef, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom"
import {socket, UserContext} from "../../socket/userSocket";
import { ChatContext, ChatBlock } from "../../socket/chatSocket";
import ChatBox from "./ChatBox";
import MyChatBox from "./MyChatBox";
import "../../css/ChatRoom.css"

//채팅방 입장 시, 히스토리 업데이트 필요함!
//chatMessage 업데이트 확인 필요!
//chat 길이 확인!

export default function ChatRoom(props :any){
	const userContext = useContext(UserContext);
	const chatContext = useContext(ChatContext);
	const chatHistory = chatContext.history;
	const history = useHistory();
	const [chat, setChat] = useState("");
	const chatInput = useRef<any>(null);
	const chatid = chatContext.chatroom[0]?.order[props.idx];

	useEffect(()=>{
		if (!chatHistory[0] || chatHistory[0].chatid !== props.idx){
			socket.emit("chatHistory", {
				chatid: props.idx,
			});
		}
		socket.on("chatHistory", (data)=>{
			chatHistory[1](data);
		})
	}, [chat, chatHistory, props.idx]);

	const handleInputChange = (e :any) => {
		setChat(e.target.value);
	}
	const handleSendBtn = (event:any) => {
		socket.emit("chatMessage", {
			chatid: props.idx,
			content: chat,
		}, (result:boolean)=>{
			if (result === false)
				alert("mute!!!");
		});
		chatInput.current?.reset();        
	}
	const handleInputKeypress = (event:any) => {
		if (event.key === "Enter"){
			handleSendBtn(event);
		}
	}

	return (
		<div className="container-fluid p-2" key={`chatroom${props.idx}`}>
			<div className="col">
				<div className="row m-1" onClick={()=>{history.goBack()}}><i className="bi bi-arrow-left" id="leftArrow"></i></div>
				<div className="row m-0" id="chatlist">
					{chatHistory[0] && chatHistory[0].list?.map((data:ChatBlock, idx:number)=>{
						if (data.userid === userContext.user[0].id)
							return <MyChatBox idx={idx} chatid={chatid} content={data.content}></MyChatBox>
						else
							return <ChatBox idx={idx} chatid={chatid} userid={data.userid} content={data.content}></ChatBox>
					})}
				</div>
				<form className="d-flex m-0 p-0" id="chatForm" ref={chatInput}>
					<input className="col" id="chatInput" onChange={(e)=>handleInputChange(e)} onKeyPress={handleInputKeypress}></input>
					<button className="col-2" id="chatSend" onClick={handleSendBtn}><i className="bi bi-play"/></button>
				</form>
			</div>
		</div>
	);
}