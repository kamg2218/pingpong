import { useContext, useEffect } from "react"
import "../../css/MenuGame.css"
import Profile from "../../icons/Profile"
import {Friend, socket, UserContext, User} from "../../socket/userSocket"

export function NewList(person: Friend): any {
	const userContext = useContext(UserContext);

	const handleNewFriend = (result: boolean) => {
		socket.emit("newFriend", {
			userid: person.userid,
			result: result
		});
		const user = userContext.user;
		user[1](user[0].newfriends?.filter((friend:Friend)=>friend.userid !== person.userid));
	}
	return (
		<div className="m-0 p-2 h6" id="friendonoff" key={person.userid}>
			<div className="col-7" id="friendNick">
				<i className="bi bi-exclamation-lg" id="exclamationMark"></i>
				{person.nickname}
			</div>
			<i className="bi bi-check-lg px-2" id="checkMark" onClick={()=>handleNewFriend(true)}/>
			<i className="bi bi-x-lg px-2" id="crossMark" onClick={()=>handleNewFriend(false)}/>
		</div>
	);
}

export function OldList(person: Friend, setClicked: Function): any {
	const handleClick = () => {
		setClicked(person.userid);
	}
	return (
		<div className="m-0 p-2" id="friendonoff" key={person.userid} onClick={handleClick} data-toggle="modal" data-target="#ProfileModal">
			<div className="col-8 m-0 mx-1 px-2 h6" id="friendNick">{person.nickname}</div>
			<div className="col">
				{person.onoff ? <div className="circle bg-danger"/> : <div className="circle bg-light" id="light-circle"/>}
			</div>
		</div>
	);
}

export default function MenuGame(props:any){
	const userContext = useContext(UserContext);
	const user:User = userContext.user[0];

	useEffect(()=>{
	}, []);
	return (
		<div className="container p-2" id="menu">
			<div className="col justify-content-center">
				<img src={Profile(user?.profile ? user.profile : 1)} className="row mx-auto my-3" alt="profile" id="menuGameProfile"/>
				<div className="row h2 mx-4 p-2"  id="menuNick" data-toggle="modal" data-target="#MyProfileModal">{user?.nickname}</div>
				<label className="row mt-3" id="menuRecord">WIN : LOSE</label>
				<div className="row h1 mb-4" id="winLose">{user?.win} : {user?.lose}</div>
				<div className="row m-1 p-1" id="friendList">
					{user && user.newfriends?.map((people:Friend) => (NewList(people)))}
					{user && user.friends?.map((people:Friend) => (OldList(people, props.setClicked)))}
				</div>
			</div>
		</div>
	);
}