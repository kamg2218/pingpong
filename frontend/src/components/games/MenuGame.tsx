import { useContext, useEffect, useState } from "react"
import "../../css/MenuGame.css"
import Profile from "../../icons/Profile"
import {Friend, socket, UserContext} from "../../socket/userSocket"

export function NewList(person: Friend): any {
	const handleNewFriend = (result: boolean) => {
		socket.emit("newFriend", {
			userid: person.userid,
			result: result
		});
	}

	return (
		<div className="d-flex m-0 p-2 h6" id="friendonoff" key={person.nickname}>
			<div className="col-7 text-start" id="friendNick">
				<i className="bi bi-exclamation-lg" id="exclamationMark"></i>
				{person.nickname}
			</div>
			<i className="bi bi-check-lg px-2 Mark" id="checkMark" onClick={()=>handleNewFriend(true)}/>
			<i className="bi bi-x-lg px-2 Mark" id="crossMark" onClick={()=>handleNewFriend(false)}/>
		</div>
	);
}

export function OldList(person: Friend, setClicked: Function): any {
	const handleClick = () => {
		setClicked(person.userid);
	}
	return (
		<div className="btn d-flex m-0 p-1 align-items-center" id="friendonoff" key={person.nickname} onClick={handleClick} data-toggle="modal" data-target="#ProfileModal">
			<div className="col-8 text-start px-1 h6" id="friendNick">{person.nickname}</div>
			{person.onoff ? <div className="circle bg-danger"/> : <div className="circle bg-light"/>}
		</div>
	);
}

export default function MenuGame(props:any){
	const userContext = useContext(UserContext);
	const [user] = useState(userContext.user[0]);

	useEffect(()=>{}, [user, userContext]);
	return (
		<div className="container p-2" id="menu">
			<div className="col justify-content-center">
				<img src={Profile(user?.profile ? user.profile : 1)} className="row mx-auto my-3" alt="profile" id="menuGameProfile"/>
				<div className="row h2 mx-4 p-2"  id="menuNick" data-toggle="modal" data-target="#MyProfileModal">{user?.nickname}</div>
				<label className="row mt-3" id="menuRecord">WIN : LOSE</label>
				<div className="row h1 mb-4" id="winLose">{user?.win} : {user?.lose}</div>
				<div className="row m-1 p-1" id="friendList">
					{user?.newfriends?.map((people:Friend) => (NewList(people)))}
					{user?.friends.map((people:Friend) => (OldList(people, props.setClicked)))}
				</div>
			</div>
		</div>
	);
}