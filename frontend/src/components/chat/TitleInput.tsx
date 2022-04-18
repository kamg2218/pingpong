import { useState } from 'react';
import { socket } from '../../socket/socket';
import { chatRoom } from '../../types/chatTypes';

export default function TitleInput({changeTitle, info}:{changeTitle:Function, info:chatRoom}){
	const [title, setTitle] = useState(info.title);

	const handleTitleChange = (e :any) => { setTitle(e.target.value); }
	const handleTitleClick = () => {
		socket.emit('updateChatRoom', {
			chatid: info.chatid,
			title: title
		}, (result:boolean)=>{ console.log(result); });
		changeTitle();
	}
	const handleKeyPress = (e :any) => {
		if (e.key === 'Enter'){ handleTitleClick(); }
	}

	return (
		<div key={`titleInput_${info.chatid}`} className='d-flex' id='titleInput'>
			<input className='d-none' type='password'/>
			<input className='col-10' id='titleInputBox' key={`titleInputBox_${info.chatid}`} value={title} placeholder={title} onChange={e => handleTitleChange(e)} onKeyPress={e=>handleKeyPress(e)}></input>
			<button className='col btn p-1' id='titleInputSubmit' key={`titleInputSubmit_${info.chatid}`} onClick={handleTitleClick}>OK</button>
		</div>
	);
}