import { useContext, useEffect, useState } from 'react'
import '../../css/MenuGame.css'
import Profile from '../../icons/Profile'
import {Friend, socket, UserContext} from '../../socket/userSocket'

export function NewList(person: Friend): any {
	const userContext = useContext(UserContext);
	const [user] = useState(userContext.user[0]);

	useEffect(()=>{
		console.log('new list');
	}, [user, userContext]);
	// console.log(person);
	const handleNewFriend = (result: boolean) => {
		console.log(result);
		socket.emit("newFriend", {
			userid: person.userid,
			result: result
		// }, async ()=>{
		// 	await user.newfriends.filter((p:Friend) => p.userid !== person.userid);
		// 	// setNewone(newone.filter(p => p.userid !== person.userid));
		// 	userContext.user[1](user);
		});
		console.log(user);
	}

	return (
		<div className='d-flex m-0 p-2 h6' id='friendonoff' key={person.nickname}>
			<div className='col-7 text-start' id='friendNick'>
				<i className="bi bi-exclamation-lg" id='exclamationMark'></i>
				{person.nickname}
			</div>
			<i className="bi bi-check-lg px-2 Mark" id='checkMark' onClick={()=>handleNewFriend(true)}/>
			<i className="bi bi-x-lg px-2 Mark" id='crossMark' onClick={()=>handleNewFriend(false)}/>
		</div>
	);
}

export function OldList(person: Friend, setClicked: Function): any {
	const handleClick = () => {
		setClicked(person.userid);
	}
	return (
		<div className='btn d-flex m-0 p-1 align-items-center' id='friendonoff' key={person.nickname} onClick={handleClick} data-toggle='modal' data-target='#ProfileModal'>
			<div className='col-8 text-start px-1 h6' id='friendNick'>{person.nickname}</div>
			{person.onoff ? <div className="circle bg-danger"/> : <div className="circle bg-light"/>}
		</div>
	);
}

export default function MenuGame(props:any){
	const userContext = useContext(UserContext);
	const [user] = useState(userContext.user[0]);

	useEffect(()=>{}, [user, userContext]);
	return (
		<div className='container m-1 p-2' id='menu'>
			<div className='col justify-content-center'>
				<img src={Profile(user?.profile ? user.profile : 1)} className="row mx-auto my-4" alt="profile" id="profile"/>
				<div id='menuNick' className='row mx-2 justify-content-center' data-toggle='modal' data-target='#MyProfileModal'>{user?.nickname}</div>
				<label className='row mx-3 my-2 justify-content-center' id='menuRecord'>WIN : LOSE</label>
				<div className='row justify-content-center' id='winLose'>{user?.win} : {user?.lose}</div>
				<div className='row scroll-box m-1 p-1 border justify-content-center' id='friendList'>
					{user?.newfriends?.map((people:Friend) => (NewList(people)))}
					{user?.friends.map((people:Friend) => (OldList(people, props.setClicked)))}
				</div>
			</div>
		</div>
	);
}