import {useContext} from "react";
import Profile from "../../icons/Profile"
import { ChatContext, ChatData } from "../../socket/chatSocket"

export default function ChatBox(props:any){
	const chatContext = useContext(ChatContext);
	const chatRoom:ChatData = chatContext.chatroom[0];
	const room = chatRoom?.chatroom.find(data => data.chatid === props.chatid);
	const member = room?.members.find(person => person.userid === props.userid);
	let profile = Profile(member?.profile ?? 1);

	const makeTime = () => {
		if (!props.data || !props.data.createDate){
			return "";
		}
		let date:Date = new Date(props.data.createDate);
		console.log(`time = ${date}, ${typeof date}`);
		const hour = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${hour}:${minutes}`;
	}

	return (
		<div className="container mx-1 p-0" key={`${props.chatid}chatbox${props.idx}`} id={props.idx}>
			<div className="row align-items-start">
				<img src={profile} className="col-2 rounded-circle m-1" alt="..."/>
				<div className="col">
					<div className="row col-12">{member ? member.nickname : "unknown"}</div>
					<div className="row col-12" id="chatboxcontent">{props.data.contents}</div>
					<div className="row col-12 small text-muted">{makeTime()}</div>
				</div>
			</div>
		</div>
	);
}