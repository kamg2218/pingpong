import {chatroom} from '../../socket/chatSocket'
import Profile from '../../icons/Profile'

export default function ChatBox(props:any){
	const room = chatroom.chatroom.find(data => data.chatid === props.chatid);
	const member = room?.members.find(person => person.userid === props.userid);
	let profile = Profile(member?.profile ?? 1);

	function makeTime(){
		let date = new Date();
		console.log(typeof date);
		const hour = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${hour}:${minutes}`;
	}

	return (
		<div className="col mx-1 p-0" key={`${props.chatid}chatbox${props.idx}`} id={props.idx}>
			<div className="row align-items-start">
				<img src={profile} className="col-2 rounded-circle m-1" alt="..."/>
				<div className="col">
					<div className="row col-12">{member ? member.nickname : 'unknown'}</div>
					<div className="row col-12 border rounded bg-light p-2">{props.content}</div>
					<div className="row col-12 small text-muted my-1 justify-content-end">{makeTime()}</div>
				</div>
			</div>
		</div>
	);
}