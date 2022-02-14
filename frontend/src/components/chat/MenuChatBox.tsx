import { useContext, useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import TitleInput from "./TitleInput"
import MenuChatDropdown from "./MenuChatDropdown"
import { User, ChatContext } from "../../socket/chatSocket"
import { socket } from "../../socket/userSocket"

function memberlist(member: Array<User>) : string {
	let list :string = "";
	console.log(member.length);
	for (let i = 0; i < member.length; i++){
		if (i === 3){
			list += ", ...";
			return list;
		}
		else if (i > 0)
			list += ", ";
		list += member[i].nickname;
	}
	return list;
}

export default function MenuChatBox(props :any){
	const [title, setTitle] = useState(props.info.title)
	const history = useHistory()
	const chatContext = useContext(ChatContext);

	useEffect(()=>{
	}, []);
	const handleTitle = (chatid:string, newTitle: string) => {
		setTitle(newTitle);
		props.setTitle(chatid, newTitle);
	}
	const handleDoubleClick = (chatid: string) => {
		const idx = chatContext.chatroom[0]?.order.indexOf(chatid);
		if (idx !== -1){
			socket.emit("chatHistory", {
				chatid: chatid
			});
			history.push(`/game/chat/${idx}`)
		}
	}

	return(
		<li key={`menuchatbox_${props.info.chatid}`} className="col-12 btn m-1" id="chatBox" onDoubleClick={()=>handleDoubleClick(props.info.chatid)}>
			<div key={`box_${props.info.chatid}`} className="d-flex">
				<div key={`title_${props.info.chatid}`} className="h6 m-1 overflow-hidden" id="boxTitle">
					{props.info.title[0] === "#" ?
						<TitleInput setTitle={handleTitle} info={props.info}/>
							: (props.info.title !== "" ? props.info.title : memberlist(props.info.members))
					}
				</div>
				{/* <div className="font-weight-light member" id="boxMembers">{props.info.title[0] === "#" ?? props.info.member.length}</div> */}
			</div>
			<MenuChatDropdown info={props.info} setTitle={handleTitle}/>
		</li>
	);
}