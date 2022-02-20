// import "bootstrap/dist/js/bootstrap";
import {useContext, useState} from "react";
import { socket, UserContext } from "../../socket/userSocket";
import PwdModal from "../modals/PwdModal";
import MuteModal from "../modals/MuteModal";
import InviteModal from "../modals/InviteModal";
import "./chat.css";

export default function MenuChatDropdown(props :any){
	const userContext = useContext(UserContext);
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
		socket.emit("exitChatRoom", { chatid: props.info.chatid }, (result:boolean)=>{
			if (result === true){
				socket.emit("myChatRoom");
				window.location.reload();
			}
		});
	}

	return (
		<div key={props.info.chatid} className="dropdown">
			<button className="btn float-end" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
				<i className="bi bi-three-dots-vertical"></i>
			</button>
			<ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
				<li className="dropdown-item" key="title">
					<button className="btn" key="title" onClick={()=>handleTitle()} disabled={props.info.owner !== userContext.user[0]?.id}>Title</button>
				</li>
				<li className="dropdown-item" key="pwd">
					<button type="button" className="btn" data-toggle="modal" data-target="#pwdModal" disabled={pwdDisabled}>Password</button>
				</li>
				<li className="dropdown-item" key="invite">
					<button className="btn" data-toggle="modal" data-target="#inviteModal">Invite</button>
				</li>
				<li className="dropdown-item" key="mute">
					<button className="btn" data-toggle="modal" data-target="#muteModal">Mute</button>
				</li>
				<li className="dropdown-item" key="exit">
					<button className="btn" onClick={() => handleExit()}>Exit</button>
				</li>
			</ul>
			<PwdModal info={props.info}></PwdModal>
			<InviteModal info={props.info}></InviteModal>
			<MuteModal info={props.info}></MuteModal>
		</div>
	);
}