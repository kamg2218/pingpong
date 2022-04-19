import { useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import {socket} from '../../socket/socket';
import { User } from '../../types/userTypes';
import { chatRoom } from '../../types/chatTypes';
import { RootState } from '../../redux/rootReducer';
import './chat.css';

export default function MenuChatDropdown({info, setInfo, changeTitle, handleExit}:{info:chatRoom, setInfo:Function, changeTitle:Function, handleExit:Function}){
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);
	const [pwdDisabled] = useState( info.owner !== user.userid ? true : !info.lock);
	const muteDisables:boolean = (info.manager?.findIndex((man)=>man === user.userid) !== -1 || info.owner === user.userid) ? false : true;

	const handleTitle = () => {
		changeTitle();
	}
	const handleChatExit = () => {
		socket.emit('exitChatRoom', { chatid: info.chatid }, (result:boolean)=>{
			if (result === true){ handleExit(info.chatid); }
		});
	}

	return (
		<div key={info.chatid} className='dropdown'>
			<button className='btn float-end' type='button' id='dropdownMenuButton' data-bs-toggle='dropdown' aria-expanded='false' onClick={()=>setInfo(info)}>
				<i className='bi bi-three-dots-vertical'></i>
			</button>
			<ul className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
				<li className='dropdown-item' key='title'>
					<button className='btn w-100' onClick={handleTitle} disabled={info.owner !== user?.userid}>Title</button>
				</li>
				<li className='dropdown-item' key='pwd'>
					<button className='btn w-100' data-toggle='modal' data-target='#pwdModal' disabled={pwdDisabled}>Password</button>
				</li>
				<li className='dropdown-item' key='manager'>
					<button className='btn w-100' data-toggle='modal' data-target='#managerModal' disabled={info.owner !== user?.userid}>Manager</button>
				</li>
				<li className='dropdown-item' key='invite'>
					<button className='btn w-100' data-toggle='modal' data-target='#inviteModal'>Invite</button>
				</li>
				<li className='dropdown-item' key='mute'>
					<button className='btn w-100' data-toggle='modal' data-target='#muteModal' disabled={muteDisables}>Mute</button>
				</li>
				<li className='dropdown-item' key='exit'>
					<button className='btn w-100' onClick={handleChatExit}>Exit</button>
				</li>
			</ul>
		</div>
	);
}