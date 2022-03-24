import { useContext, useEffect } from "react";
import { socket } from "../../socket/userSocket";
import { chatRoom, ChatContext } from "../../socket/chatSocket";
import MenuChatBox from "./MenuChatBox";
import AddChatModal from "../modals/AddChatModal";
import PublicChatModal from "../modals/PublicChatModal"

export default function MenuChat(){
	const {chatroom} = useContext(ChatContext);

	useEffect(()=>{
		console.log("MenuChat");
		if (!chatroom[0]){
			socket.emit("myChatRoom");
		}
	}, []);
	const handlePublic = () => {
		socket.emit("publicChatRoom");
	}

	return (
		<div key="menuchat" className="container" id="menuChatList">
			<div className="d-flex justify-content-end my-2">
				<button type="button" className="btn" id="chatButton" data-toggle="modal" data-target="#addChatModal">
					<i className="bi bi-chat"/>
				</button>
				<button type="button" className="btn" id="chatButton" data-toggle="modal" data-target="#publicChatModal" onClick={handlePublic}>
					<i className="bi bi-unlock"/>
				</button>
			</div>
			<div id="chatBoxList">
				<ul id="chatBoxUl" className="col">
					{chatroom[0] && chatroom[0].chatroom?.map((info:chatRoom) => <MenuChatBox key={`menuchatbox_${info.chatid}`} info={info}/>)}
				</ul>
			</div>
			<AddChatModal></AddChatModal>
			<PublicChatModal></PublicChatModal>
		</div>
	);
}