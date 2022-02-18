import { useContext, useEffect } from "react";
import { socket } from "../../socket/userSocket";
import { chatRoom, ChatContext } from "../../socket/chatSocket";
import MenuChatBox from "./MenuChatBox";
import AddChatModal from "../modals/AddChatModal";
import PublicChatModal from "../modals/PublicChatModal"

export default function MenuChat(){
	const chatContext = useContext(ChatContext);
	const chatroom = chatContext.chatroom;

	useEffect(()=>{
		console.log("MenuChat");
		if (!chatContext.chatroom[0]){
			socket.emit("myChatRoom");
		}
	}, [chatContext]);

	const handleTitleChange = (chatid :string, title :string) => {
		let chat:Array<chatRoom> = chatroom[0].chatroom;

		const idx = chat.findIndex(room => room.chatid === chatid);
		if (idx !== -1){
			chat[idx].title = title;
			chatroom[1](chat);
		}
	}

	return (
		<div key="menuchat" className="container" id="chatlist">
			<div className="d-flex justify-content-end">
				<button type="button" className="btn" id="chatButton" data-toggle="modal" data-target="#AddChatModal">
					<i className="bi bi-chat"/>
				</button>
				<button type="button" className="btn" id="chatButton" data-toggle="modal" data-target="#PublicChatModal">
					<i className="bi bi-unlock"/>
				</button>
			</div>
			<div className="m-1 h-90">
				<ul key="chatBoxList" className="col list-unstyled">
					{chatroom[0] && chatroom[0].chatroom?.map((info:chatRoom) => <MenuChatBox key={`menuchatbox_${info.chatid}`} info={info} setTitle={handleTitleChange}/>)}
				</ul>
			</div>
			<AddChatModal></AddChatModal>
			<PublicChatModal></PublicChatModal>
		</div>
	);
}