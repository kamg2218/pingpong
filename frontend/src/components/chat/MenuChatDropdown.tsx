// import "bootstrap/dist/js/bootstrap";
import {useContext, useEffect, useState} from "react";
import { socket, UserContext, User } from "../../socket/userSocket";
import PwdModal from "../modals/PwdModal";
import MuteModal from "../modals/MuteModal";
import InviteModal from "../modals/InviteModal";
import "./chat.css";
import { chatRoom } from "../../socket/chatSocket";

export default function MenuChatDropdown(props :any){
	const userContext = useContext(UserContext);
	const user:User = userContext.user[0];
	const info:chatRoom = props.info;
	const [pwdDisabled] = useState( info.owner !== user?.userid ? true : info.lock);
	const muteDisables:boolean = (info.manager?.findIndex((man)=>man === user?.userid) !== -1 || info.owner === user?.userid) ? false : true;
	
	useEffect(()=>{
		console.log("chat dropdown!");
	});

	//change chatroom title
	const handleTitle = () => {
		props.changeTitle();
	}
	//exit the chatroom
	const handleExit = () => {
		console.log("exit chat room!");
		socket.emit("exitChatRoom", { chatid: info.chatid }, (result:boolean)=>{
			if (result === true){
				// socket.emit("myChatRoom");
				window.location.reload();
			}
		});
	}

	return (
		<div key={info.chatid} className="dropdown">
			<button className="btn float-end" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
				<i className="bi bi-three-dots-vertical"></i>
			</button>
			<ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
				<li className="dropdown-item" key="title">
					<button className="btn w-100" onClick={()=>handleTitle()} disabled={info.owner !== user?.userid}>Title</button>
				</li>
				<li className="dropdown-item" key="pwd">
					<button className="btn w-100" data-toggle="modal" data-target="#pwdModal" disabled={pwdDisabled}>Password</button>
				</li>
				<li className="dropdown-item" key="invite">
					<button className="btn w-100" data-toggle="modal" data-target="#inviteModal">Invite</button>
				</li>
				<li className="dropdown-item" key="mute">
					<button className="btn w-100" data-toggle="modal" data-target="#muteModal" disabled={muteDisables}>Mute</button>
				</li>
				<li className="dropdown-item" key="exit">
					<button className="btn w-100" onClick={() => handleExit()}>Exit</button>
				</li>
			</ul>
			<PwdModal info={info}></PwdModal>
			<InviteModal info={info}></InviteModal>
			<MuteModal info={info}></MuteModal>
		</div>
	);
}