import 'bootstrap/dist/js/bootstrap';
// import { useState } from 'react';
import { user, socket } from '../../socket/socket';
import PwdModal from '../modals/PwdModal';
import InviteModal from '../modals/InviteModal';

export default function MenuChatDropdown(props :any){
	//change chatroom title
	const handleTitle = () => {
		props.setTitle(props.info.idx, '#' + props.info.title);
		props.setState('#' + props.info.title);
	}
	//exit the chatroom
	const handleExit = () => {
		socket.emit('exitChatRoom', { chatid: props.info.chatid }, (result:boolean)=>{
			if (result === true){
				// user.
			}
		});
	}

    return (
        <div id={props.info.idx} className="dropdown">
	        <button className="btn float-end" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="bi bi-three-dots-vertical"></i>
	        </button>
	        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
				<li className='dropdown-item' key='title'>
					<button className='btn' key='title' onClick={()=>handleTitle()} disabled={props.info.owner !== user.id}>title</button>
				</li>
				<li className='dropdown-item' key='pwd'>
					<button type='button' className='btn' data-toggle='modal' data-target='#pwdModal'>password</button>
				</li>
				<li className='dropdown-item' key='invite'>
					<button className='btn' data-toggle='modal' data-target='#inviteModal'>invite</button>
				</li>
				<li className='dropdown-item' key='exit'>
		        	<button className='btn' onClick={() => handleExit()}>exit</button>
				</li>
	        </ul>
			<PwdModal info={props.info}></PwdModal>
			<InviteModal info={props.info}></InviteModal>
	    </div>
    );
}