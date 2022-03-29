import { useEffect } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
import { RootState } from "../../redux/rootReducer";
import { chatRoom, ChatData } from "../../types/chatTypes";
import MenuChatBox from "./MenuChatBox";
import AddChatModal from "../modals/AddChatModal";
import PublicChatModal from "../modals/PublicChatModal"

export default function MenuChat(){
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);

	useEffect(()=>{
		console.log("MenuChat");
		// console.log(chatroom);
	}, [chatroom]);
	const handlePublic = () => { socket.emit("publicChatRoom"); }

	return (
		<div key="menuchat" className="container" id="menuChatList">
			<div className="d-flex justify-content-end my-2">
				<button type="button" className="btn" id="chatButton" data-toggle="modal" data-target="#addChatModal"><i className="bi bi-chat"/></button>
				<button type="button" className="btn" id="chatButton" data-toggle="modal" data-target="#publicChatModal" onClick={handlePublic}><i className="bi bi-unlock"/></button>
			</div>
			<div id="chatBoxList">
				<ul id="chatBoxUl" className="col">
					{chatroom && chatroom.chatroom?.map((info:chatRoom) => <MenuChatBox key={`menuchatbox_${info.chatid}`} info={info}/>)}
				</ul>
			</div>
			<AddChatModal></AddChatModal>
			<PublicChatModal></PublicChatModal>
		</div>
	);
}