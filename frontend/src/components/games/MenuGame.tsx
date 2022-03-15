import { useContext, useEffect } from "react"
import "../../css/MenuGame.css"
import Profile from "../../icons/Profile"
import {Friend, socket, UserContext} from "../../socket/userSocket"

export default function MenuGame(props:any){
	const {user} = useContext(UserContext);
	// const user = userContext.user;

	useEffect(()=>{},[user]);
	function NewList(person: Friend): any {
		const handleNewFriend = (result: boolean) => {
			socket.emit("newFriend", {
				userid: person.userid,
				result: result
			});
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

	function OldList(person: Friend, setClicked: Function): any {
		const handleClick = () => {
			setClicked(person.userid);
		}
		return (
			<div className="m-0 p-2" id="friendonoff" key={person.userid} onClick={handleClick} data-toggle="modal" data-target="#profileModal">
				<div className="col-8 m-0 mx-1 px-2 h6" id="friendNick">{person.nickname}</div>
				<div className="col">
					{person.onoff ? <div className="circle bg-danger"/> : <div className="circle bg-light" id="light-circle"/>}
				</div>
			</div>
		);
	}

	return (
		<div className="container p-2" id="menu">
			<div className="col justify-content-center">
				<img src={Profile(user[0]?.profile ? user[0].profile : 0)} className="row mx-auto my-3" alt="profile" id="menuGameProfile"/>
				<div className="row h2 mx-4 p-2"  id="menuNick" data-toggle="modal" data-target="#myProfileModal">{user[0]?.nickname}</div>
				<label className="row mt-3" id="menuRecord">WIN : LOSE</label>
				<div className="row h1 mb-4" id="winLose">{user[0]?.win} : {user[0]?.lose}</div>
				<div className="row m-1 p-1" id="friendList">
					{user[0] && user[0].newfriends?.map((people:Friend) => (NewList(people)))}
					{user[0] && user[0].friends?.map((people:Friend) => (OldList(people, props.setClicked)))}
				</div>
			</div>
		</div>
	);
}