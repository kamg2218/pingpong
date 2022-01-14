// import { useState } from 'react'
// import Profile from '../../icons/Profile'
// import {Friend, socket} from '../../socket/userSocket'

export default function MenuPlay(){
	return (
		<div className='container m-1 p-2' id='menu'>
			{/* <div className='col justify-content-center'>
				<img src={Profile(user.profile ?? 1)} className="row mx-auto my-4" alt="profile" id="profile"/>
				<div id='menuNick' className='row justify-content-center'>{user.nickname}</div>
				<label className='row mx-3 my-2 justify-content-center' id='menuRecord'>WIN : LOSE</label>
				<div className='row justify-content-center' id='winLose'>{user.win} : {user.lose}</div>
				<div className='row scroll-box m-1 p-1 border justify-content-center' id='friendList'>
					{user.newfriends?.map(people => (NewList(people)))}
					{user.friends.map(people => (OldList(people)))}
				</div>
			</div> */}
		</div>
	);
}