import {useContext, useEffect, useState} from "react";
import Profile from "../../icons/Profile"
import { ChatContext, ChatData } from "../../context/chatContext"
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";

export default function ChatBox(props:any){
	// const chatContext = useContext(ChatContext);
	// const chatRoom:ChatData = chatContext.chatroom[0];
	const chatRoom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);

	const room = chatRoom.chatroom.find(data => data.chatid === props.chatid);
	const member = room?.members.find(person => person.userid === props.userid);
	const [chatTime, setTime] = useState<string>("");

	// const dispatch = useDispatch();

	useEffect(()=>{
		const makeTime = () => {
			if (!props.data || !props.data.createDate){ return "00:00"; }
			let date:Date = new Date(props.data.createDate);
			console.log(`time = ${date}, ${typeof date}`);
			const hour = String(date.getHours()).padStart(2, "0");
			const minutes = String(date.getMinutes()).padStart(2, "0");
			setTime(`${hour}:${minutes}`);
		}
		if (chatTime && chatTime === ""){
			makeTime();
		}
	}, [chatTime, props.data]);

	return (
		<div className="container p-0" key={`${props.chatid}chatbox${props.idx}`} id={props.idx}>
			<div className="row align-items-start">
				<img src={Profile(member?.profile ? member.profile : 0)} className="col-2 rounded-circle m-1" alt="..."/>
				<div className="col">
					<div className="row col-12">{member ? member.nickname : "unknown"}</div>
					<div className="row col-12" id="chatboxcontent">{props.data.contents}</div>
					<div className="row col-12 small text-muted">{chatTime}</div>
				</div>
			</div>
		</div>
	);
}