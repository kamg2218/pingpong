import { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom"
import {socket, UserContext} from "../../socket/userSocket";
import { ChatContext, ChatBlock } from "../../socket/chatSocket";
import ChatBox from "./ChatBox";
import MyChatBox from "./MyChatBox";
import "../../css/ChatRoom.css"
import { GameContext } from "../../socket/gameSocket";

//채팅방 입장 시, 히스토리 업데이트 필요함!
//chatMessage 업데이트 확인 필요!
//chat 길이 확인!

export default function ChatRoom(props :any){
	const userContext = useContext(UserContext);
	const chatContext = useContext(ChatContext);
	const history = chatContext.history;
	const game = useContext(GameContext).gameroom;
	const path:string = `/game/chat${game[0] ? `/waiting/${game[0].roomid}`: ""}`;
	const [chat, setChat] = useState("");
	const chatInput = useRef<any>(null);
	const chatid = chatContext.chatroom[0]?.order[props.idx];

	useEffect(()=>{
		if (!history[0] || history[0].chatid !== props.idx){
			socket.emit("chatHistory", {
				chatid: props.idx,
			});
		}
		socket.on("chatHistory", (data)=>{
			history[1](data);
		})
	}, [chat, history, props.idx]);

	const handleInputChange = (e :any) => {
		setChat(e.target.value);
	}
	const handleSendBtn = (event:any) => {
		// const idx = props.idx;
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
				<Link to={path} className="row m-1"><i className="bi bi-arrow-left" id="leftArrow"></i></Link>
				<div className="row m-0" id="chatlist">
					{history[0] && history[0].list?.map((data:ChatBlock, idx:number)=>{
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