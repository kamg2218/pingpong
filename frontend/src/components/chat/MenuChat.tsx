import { useContext, useEffect, useState } from "react";
import { socket } from "../../context/userContext";
import { chatRoom, ChatContext, ChatData } from "../../context/chatContext";
import MenuChatBox from "./MenuChatBox";
import AddChatModal from "../modals/AddChatModal";
import PublicChatModal from "../modals/PublicChatModal"
import { RootState } from "../../redux/rootReducer";
import { shallowEqual, useSelector } from "react-redux";

export default function MenuChat(){
	// const {chatroom} = useContext(ChatContext);
	// const dispatch = useDispatch();
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	// const [room, setRoom] = useState<ChatData>(chatroom);

	useEffect(()=>{
		console.log("MenuChat");
		console.log(chatroom);
		// if (!chatroom[0]){
		// 	console.log("myChatRoom emitted! - MenuChat");
		// 	socket.emit("myChatRoom");
		// }
	}, [chatroom]);
	const handlePublic = () => {
		console.log("publicChatRoom emitted! - MenuChat");
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
					{chatroom && chatroom.chatroom?.map((info:chatRoom) => <MenuChatBox key={`menuchatbox_${info.chatid}`} info={info}/>)}
				</ul>
			</div>
			<AddChatModal></AddChatModal>
			<PublicChatModal></PublicChatModal>
		</div>
	);
}