import { shallowEqual, useSelector } from "react-redux";
import { ChatData } from "../../types/chatTypes"
import { useEffect, useState } from "react";
import { RootState } from "../../redux/rootReducer";
import Profile from "../../icons/Profile"

export default function ChatBox(props:any){
	const chatRoom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	const room = chatRoom.chatroom.find(data => data.chatid === props.chatid);
	const member = room?.members.find(person => person.userid === props.userid);
	const [time, setTime] = useState<string>("00:00");

	useEffect(()=>{
		if (time === "00:00"){
			setTime(makeTime());
		}
	}, [time]);
	const makeTime = () => {
		if (!props.data || !props.data.createDate){ return "00:00"; }
		let date:Date = new Date(props.data.createDate);
		console.log(`time = ${date}, ${typeof date}`);
		const hour = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return (`${hour}:${minutes}`);
	}
	return (
		<div className="container p-0" key={`${props.chatid}chatbox${props.idx}`} id={props.idx}>
			<div className="row align-items-start">
				<img src={Profile(member?.profile ? member.profile : 0)} className="col-2 rounded-circle m-1" alt="..."/>
				<div className="col">
					<div className="row col-12">{member ? member.nickname : "unknown"}</div>
					<div className="row col-12" id="chatboxcontent">{props.data.contents}</div>
					<div className="row col-12 small text-muted">{time}</div>
				</div>
			</div>
		</div>
	);
}