import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { shallowEqual, useSelector } from "react-redux"
import { socket } from "../../socket/socket"
import { RootState } from "../../redux/rootReducer"
import {User} from "../../types/userTypes"
import { ChatUser, ChatData } from "../../types/chatTypes"
import TitleInput from "./TitleInput"
import MenuChatDropdown from "./MenuChatDropdown"

function memberlist(member: Array<ChatUser>) : string {
	let list :string = "";
	for (let i = 0; i < member.length; i++){
		if (i === 3){
			list += ", ...";
			return list;
		} else if (i > 0){ list += ", "; }
		list += member[i].nickname;
	}
	return list;
}

export default function MenuChatBox(props :any){
	const history = useHistory()
	const size:number = props.info.members.length;
	const [check, setChange] = useState<boolean>(false);
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	const user:User = useSelector((state:RootState)=>state.userReducer.user, shallowEqual);

	useEffect(()=>{
		console.log("MenuChatBox!");
		if (props.info.onwer === user.userid){
			console.log("I'm the owner");
		}
	}, [check, props.info.onwer, user.userid]);

	const changeTitle = () => { setChange(!check); }
	const handleDoubleClick = (chatid: string) => {
		const idx = chatroom.order.indexOf(chatid);
		if (idx !== -1){
			socket.emit("chatHistory", { chatid: chatid });
			if (history.location.pathname.length === 10){
				history.push(`/game/chat/${idx}`);
			}else{
				history.push(`/game/chat/${idx}` + history.location.pathname.slice(10));
			}
		}
	}

	return(
		<li key={`menuchatbox_${props.info.chatid}`} className="col-12 btn mt-2" id="chatBox" onDoubleClick={()=>handleDoubleClick(props.info.chatid)}>
			<div key={`box_${props.info.chatid}`} className="d-flex">
				<div key={`title_${props.info.chatid}`} className="h6 m-1 overflow-hidden" id="boxTitle">
					{ check ?
							<TitleInput changeTitle={changeTitle} info={props.info}/>
							: (props.info.title !== "" ? props.info.title : memberlist(props.info.members))
					}
				</div>
				{ !check && <div className="font-weight-light member" id="boxMembers">{size}</div> }
				{props.info.type === "private" ? <i className="]mx-1 px-2 bi bi-lock"/> : <i className="mx-1 px-2 bi bi-unlock"/>}
				{props.info.lock ? <i className="mx-1 px-1 bi bi-key"/> : ""}
			</div>
			<MenuChatDropdown info={props.info} changeTitle={changeTitle} handleExit={props.handleExit}/>
		</li>
	);
}