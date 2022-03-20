import { useContext } from 'react';
import Profile from '../../icons/Profile';
import {UserContext} from '../../socket/userSocket'
import "./chat.css"

export default function MyChatBox(props:any){
	const {user} = useContext(UserContext);
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
		<div className="container m-0 p-0" key={`${props.chatid}mychatbox${props.idx}`} id={props.idx}>
			<div className="row align-items-start justify-content-end">
				<div className="col-8">
					<div className="row col-12 justify-content-end" id="mychatboxnickname">{user[0].nickname}</div>
					<div className="row col-12" id="mychatboxcontent">{props.data.contents}</div>
					<div className="row col-12 small text-muted">{makeTime()}</div>
				</div>
				<img src={Profile(user[0].profile)} className="col-2 rounded-circle m-1 mx-0" alt="..."/>
			</div>
		</div>
	);
}