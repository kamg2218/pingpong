import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
import { RootState } from "../../redux/rootReducer";
import { chatRoom, ChatData, InputChatRoom, ChatUser } from "../../types/chatTypes";
import MenuChatBox from "./MenuChatBox";
import AddChatModal from "../modals/AddChatModal";
import PublicChatModal from "../modals/PublicChatModal"
import { updateChat } from "../../redux/chatReducer";

export default function MenuChat(){
	const dispatch = useDispatch();
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	const [room, setRoom] = useState<ChatData>(chatroom);

	useEffect(()=>{
		console.log("MenuChat");
		// console.log(chatroom);

		socket.on("enterChatRoom", (data:chatRoom)=>{
			console.log("enter chat room!!");
			const tmp:ChatData = chatroom;
			if (tmp.order.indexOf(data.chatid) === -1){
				// console.log(tmp.order.indexOf(data.chatid));
				tmp.order.push(data.chatid);
				tmp.chatroom.push(data);
				setRoom({...tmp});
				dispatch(updateChat(tmp));
			}
		});
		socket.on("myChatRoom", (data:ChatData)=>{
			console.log("my chat room!!");
			// console.log(data);
			setRoom(data);
			dispatch(updateChat(data));
		});
		socket.on("updateChatRoom", (data:InputChatRoom)=>{
			console.log("update Chat Room!");
			console.log(data, room);
			let tmp:ChatData = chatroom;
			const idx = tmp.order.indexOf(data.chatid);
			if (idx === -1){
				console.log("I'm not there!");
				return ;
			}
			if (data.title){ tmp.chatroom[idx].title = data.title; }
			if (data.type){ tmp.chatroom[idx].type = data.type; }
			if (data.addManager){ data.addManager.forEach((man:string)=>{
				let index:number = -1;
				index = tmp.chatroom[idx].manager?.findIndex((p:string)=>p === man);
				if (index === -1){ tmp.chatroom[idx].manager.push(man); }
			}); }
			if (data.deleteManager){ data.deleteManager.forEach(man=>tmp.chatroom[idx].manager = tmp.chatroom[idx].manager?.filter((person: string)=> man !== person)); }
			if (data.enterUser){ data.enterUser.forEach((user:ChatUser)=>{
				let index:number = -1;
				index = tmp.chatroom[idx].members.findIndex((p:ChatUser)=>p.userid===user.userid);
				if (index === -1){ tmp.chatroom[idx].members.push(user); }
			}); }
			if (data.exitUser){ data.exitUser.forEach(user=>tmp.chatroom[idx].members = tmp.chatroom[idx].members?.filter((person:ChatUser)=> user !== person.userid)); }
			if (data.switchOwner){ tmp.chatroom[idx].owner = data.switchOwner; }
			setRoom({...tmp});
			dispatch(updateChat(tmp));
			// console.log(tmp);
		});

		return ()=>{
			socket.off("enterChatRoom");
			socket.off("myChatRoom");
			socket.off("updateChatRoom");
		}
	}, [chatroom, dispatch, room]);

	const handlePublic = () => { socket.emit("publicChatRoom"); }
	const handleExit = (id: string) => {
		console.log("exitChatRoom");
		const tmp:ChatData = room;
		tmp.order = tmp.order.filter((str:string) => str !== id);
		tmp.chatroom = tmp.chatroom.filter((room:chatRoom) => room.chatid !== id);
		setRoom({...tmp});
		dispatch(updateChat(tmp));
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