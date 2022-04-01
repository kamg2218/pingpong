import { shallowEqual, useSelector } from 'react-redux';
import { User } from '../../types/userTypes';
import { RootState } from '../../redux/rootReducer';
import Profile from '../../icons/Profile';
import "./chat.css";
// import { useEffect, useState } from 'react';

export default function MyChatBox(props:any){
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);
	
	const makeTime = () => {
		if (!props.data || !props.data.createDate){ return "00:00"; }
		let date:Date = new Date(props.data.createDate);
		console.log(`time = ${date}, ${typeof date}`);
		const hour = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return (`${hour}:${minutes}`);
	}
	// const [time, setTime] = useState<string>(makeTime());

	// useEffect(()=>{
	// 	if (time === "00:00"){
	// 		setTime(makeTime());
	// 	}
	// }, []);

	return (
		<div className="container m-0 p-0" key={`${props.chatid}mychatbox${props.idx}`} id={props.idx}>
			<div className="row align-items-start justify-content-end">
				<div className="col-8">
					<div className="row col-12 justify-content-end" id="mychatboxnickname">{user.nickname}</div>
					<div className="row col-12" id="mychatboxcontent">{props.data.contents}</div>
					<div className="row col-12 small text-muted">{makeTime()}</div>
				</div>
				<img src={Profile(user.profile)} className="col-2 rounded-circle m-1 mx-0" alt="..."/>
			</div>
		</div>
	);
}