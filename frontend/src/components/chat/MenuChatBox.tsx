import { useContext, useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import TitleInput from "./TitleInput"
import MenuChatDropdown from "./MenuChatDropdown"
import { User, ChatContext, ChatData } from "../../socket/chatSocket"
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
	const history = useHistory()
	const {chatroom} = useContext(ChatContext);
	// const [tmpTitle, setTitle] = useState<string>(props.info.title);
	const [check, setChange] = useState<boolean>(false);
	const size:number = props.info.members.length;

	useEffect(()=>{}, [check]);
	const changeTitle = () => {
		setChange(!check);
	}
	// const handleTitle = (chatid:string, newTitle: string) => {
	// 	setTitle(newTitle);
	// }
	const handleDoubleClick = (chatid: string) => {
		const idx = chatroom[0]?.order.indexOf(chatid);
		if (idx !== -1){
			socket.emit("chatHistory", {
				chatid: chatid
			});
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
					{check ?
						<TitleInput changeTitle={changeTitle} info={props.info}/>
							: (props.info.title !== "" ? props.info.title : memberlist(props.info.members))
					}
				</div>
				{ !check &&
					<div className="font-weight-light member" id="boxMembers">{size}</div>
				}
			</div>
			<MenuChatDropdown info={props.info} changeTitle={changeTitle}/>
		</li>
	);
}