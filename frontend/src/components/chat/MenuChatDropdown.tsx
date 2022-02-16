// import "bootstrap/dist/js/bootstrap";
import {useContext, useState} from "react";
import { socket, UserContext } from "../../socket/userSocket";
import PwdModal from "../modals/PwdModal";
import InviteModal from "../modals/InviteModal";
import { ChatContext, chatRoom } from "../../socket/chatSocket";
import "./chat.css";

export default function MenuChatDropdown(props :any){
	const userContext = useContext(UserContext);
	// const chatContext = useContext(ChatContext);
	const [pwdDisabled] = useState(
		props.info.owner !== userContext.user[0]?.id ? true : !props.info.lock
	);

	//change chatroom title
	const handleTitle = () => {
		props.setTitle(props.info.chatid, "#" + props.info.title);
	}
	//exit the chatroom
	const handleExit = () => {
		console.log("exit chat room!");
		socket.emit("exitChatRoom", { chatid: props.info.chatid });
		// (result:boolean)=>{
		// 	if (result === true){
		// 		const chatroom = chatContext.chatroom;
		// 		chatroom[1](chatroom[0].chatroom.filter((room:chatRoom)=>room.chatid !== props.info.chatid));
		// 		chatroom[1](chatroom[0].order.filter((id:string)=>id !== props.info.chatid));
		// 	}
		// });
		socket.emit("myChatRoom");
	}

	return (
		<div key={props.info.chatid} className="dropdown">
			<button className="btn float-end" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
				<i className="bi bi-three-dots-vertical"></i>
			</button>
			<ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
				<li className="dropdown-item" key="title">
					<button className="btn" key="title" onClick={()=>handleTitle()} disabled={props.info.owner !== userContext.user[0]?.id}>title</button>
				</li>
				<li className="dropdown-item" key="pwd">
					<button type="button" className="btn" data-toggle="modal" data-target="#PwdModal" disabled={pwdDisabled}>password</button>
				</li>
				<li className="dropdown-item" key="invite">
					<button className="btn" data-toggle="modal" data-target="#InviteModal">invite</button>
				</li>
				<li className="dropdown-item" key="exit">
					<button className="btn" onClick={() => handleExit()}>exit</button>
				</li>
			</ul>
			<PwdModal info={props.info}></PwdModal>
			<InviteModal info={props.info}></InviteModal>
		</div>
	);
}