import { useEffect, useState } from "react";
// import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
// import { RootState } from "../../redux/rootReducer";
import { chatRoom, ChatData } from "../../types/chatTypes";
import MenuChatBox from "./MenuChatBox";
import AddChatModal from "../modals/AddChatModal";
import PublicChatModal from "../modals/PublicChatModal"
// import { updateChat } from "../../redux/chatReducer";

export default function MenuChat(props:any){
	// const dispatch = useDispatch();
	// const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	const [room, setRoom] = useState<ChatData>(props.room);

	useEffect(()=>{
		console.log("MenuChat");
		// console.log(chatroom);
	}, [room]);

	const handlePublic = () => { socket.emit("publicChatRoom"); }
	const handleExit = (id: string) => {
		console.log("exitChatRoom");
		const tmp:ChatData = room;
		tmp.order = tmp.order.filter((str:string) => str !== id);
		tmp.chatroom = tmp.chatroom.filter((room:chatRoom) => room.chatid !== id);
		// setRoom(tmp);
		// dispatch(updateChat(tmp));
		props.handleChat(tmp);
	}

	return (
		<div key="menuchat" className="container" id="menuChatList">
			<div className="d-flex justify-content-end my-2">
				<button type="button" className="btn" id="chatButton" data-toggle="modal" data-target="#addChatModal"><i className="bi bi-chat"/></button>
				<button type="button" className="btn" id="chatButton" data-toggle="modal" data-target="#publicChatModal" onClick={handlePublic}><i className="bi bi-unlock"/></button>
			</div>
			<div id="chatBoxList">
				<ul id="chatBoxUl" className="col">
					{room && room.chatroom?.map((info:chatRoom) => <MenuChatBox key={`menuchatbox_${info.chatid}`} info={info} handleExit={handleExit}/>)}
				</ul>
			</div>
			<AddChatModal></AddChatModal>
			<PublicChatModal></PublicChatModal>
		</div>
	);
}