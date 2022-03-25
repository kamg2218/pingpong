import { useContext, useEffect } from "react"
import "./MenuGame.css"
import Profile from "../../icons/Profile"
import {Friend, socket, UserContext, User} from "../../context/userContext"

export default function MenuGame(props:any){
	const userContext = useContext(UserContext);
	const user:User = userContext.user[0];

	useEffect(()=>{},[user]);
	
	const NewList = (person: Friend) => {
		const handleNewFriend = (result: boolean) => {
			socket.emit("newFriend", {
				userid: person.userid,
				result: result
			});
			userContext.user[1](user.newfriends.filter((friend:Friend)=>friend.userid !== person.userid));
		}
		return (
			<div id="newfriend" key={person.userid}>
				<div className="col-2" key={`${person.userid}_img`}><img src={Profile(person.profile)} alt="profile" id="friendProfile"/></div>
				<div className="col-5 m-0 mx-1 px-2 h6" id="friendNick">{person.nickname}</div>
				<i className="col-2 bi bi-check-lg px-2" id="checkMark" onClick={()=>handleNewFriend(true)}/>
				<i className="col-2 bi bi-x-lg px-2" id="crossMark" onClick={()=>handleNewFriend(false)}/>
			</div>
		);
	}

	const OldList = (person: Friend, setClicked: Function) => {
		const handleClick = () => {
			setClicked(person.userid);
		}
		return (
			<div id="oldfriend" key={person.userid} onClick={handleClick} data-toggle="modal" data-target="#profileModal">
				<div className="col-2" key={`${person.userid}_img`}><img src={Profile(person.profile)} alt="profile" id="friendProfile"/></div>
				<div className="col-8 m-0 mx-1 px-2 h6" id="friendNick">{person.nickname}</div>
				<div className="col">
					{person.onoff ? <div className="circle bg-danger"/> : <div className="circle bg-light" id="light-circle"/>}
				</div>
			</div>
		);
	}

	return (
		<div id="menuGame">
			<img src={Profile(user?.profile ? user.profile : 0)} alt="profile" id="menuGameProfile"/>
			<div className="h2" id="menuNick" data-toggle="modal" data-target="#myProfileModal">{user?.nickname}</div>
			<label id="menuRecord">WIN : LOSE</label>
			<div className="h1" id="winLose">{user?.win} : {user?.lose}</div>
			<div id="friendList">
				{user && user.newfriends?.map((people:Friend) => (NewList(people)))}
				{user && user.friends?.map((people:Friend) => (OldList(people, props.setClicked)))}
			</div>
		</div>
	);
}