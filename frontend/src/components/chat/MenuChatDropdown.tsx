// import "bootstrap/dist/js/bootstrap";
import {useContext, useEffect, useState} from "react";
import { socket, UserContext, User } from "../../socket/userSocket";
import PwdModal from "../modals/PwdModal";
import MuteModal from "../modals/MuteModal";
import InviteModal from "../modals/InviteModal";
import "./chat.css";

export default function MenuChatDropdown(props :any){
	const userContext = useContext(UserContext);
	const user:User = userContext.user[0];
	const [pwdDisabled] = useState(
		props.info.owner !== user?.userid ? true : !props.info.lock
	);
	useEffect(()=>{
		console.log("chat dropdown!");
		console.log(props.info);
		console.log(props.info.owner);
		console.log(user?.userid);
	});

	//change chatroom title
	const handleTitle = () => {
		props.changeTitle();
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
					<button className="btn w-100" onClick={()=>handleTitle()} disabled={props.info.owner !== user?.userid}>Title</button>
				</li>
				<li className="dropdown-item" key="pwd">
					<button className="btn w-100" data-toggle="modal" data-target="#pwdModal" disabled={pwdDisabled}>Password</button>
				</li>
				<li className="dropdown-item" key="invite">
					<button className="btn w-100" data-toggle="modal" data-target="#inviteModal">Invite</button>
				</li>
				<li className="dropdown-item" key="mute">
					<button className="btn w-100" data-toggle="modal" data-target="#muteModal">Mute</button>
				</li>
				<li className="dropdown-item" key="exit">
					<button className="btn w-100" onClick={() => handleExit()}>Exit</button>
				</li>
			</ul>
			<PwdModal info={props.info}></PwdModal>
			<InviteModal info={props.info}></InviteModal>
			<MuteModal info={props.info}></MuteModal>
		</div>
	);
}