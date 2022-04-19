import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { socket } from '../../socket/socket';
import { RootState } from '../../redux/rootReducer';
import { ChatUser, ChatData, chatRoom } from '../../types/chatTypes';
import TitleInput from './TitleInput';
import MenuChatDropdown from './MenuChatDropdown';

function memberlist(member: Array<ChatUser>) : string {
	let list :string = '';
	for (let i = 0; i < member.length; i++){
		if (i === 3){
			list += ', ...';
			return list;
		} else if (i > 0){ list += ', '; }
		list += member[i].nickname;
	}
	return list;
}

export default function MenuChatBox({info, handleExit}:{info:chatRoom, handleExit:Function}){
	const history = useHistory()
	const size:number = info.members.length;
	const [check, setChange] = useState<boolean>(false);
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);

	const changeTitle = () => { setChange(!check); }
	const handleDoubleClick = (chatid: string) => {
		const idx = chatroom.order.indexOf(chatid);
		if (idx !== -1){
			socket.emit('chatHistory', { chatid: chatid });
			if (history.location.pathname.length === 10){
				history.push(`/game/chat/${idx}`);
			}else{
				history.push(`/game/chat/${idx}` + history.location.pathname.slice(10));
			}
		}
	}

	return(
		<li key={`menuchatbox_${info.chatid}`} className='col-12 btn mt-2' id='chatBox' onDoubleClick={()=>handleDoubleClick(info.chatid)}>
			<div key={`box_${info.chatid}`} className='d-flex'>
				<div key={`title_${info.chatid}`} className='h6 m-1 overflow-hidden' id='boxTitle'>
					{ check ?
							<TitleInput changeTitle={changeTitle} info={info} key={`titleInput_${info.chatid}`}/>
							: (info.title !== '' ? info.title : memberlist(info.members))
					}
				</div>
				{ !check && <div className='font-weight-light member' id='boxMembers' key={`boxMembers_${info.chatid}`}>{size}</div> }
				{info.type === 'private' ? <i className=']mx-1 px-2 bi bi-lock' key={`lock_${info.chatid}`}/> : <i className='mx-1 px-2 bi bi-unlock' key={`unlock_${info.chatid}`}/>}
				{info.lock ? <i className='mx-1 px-1 bi bi-key' key={`key_${info.chatid}`}/> : ''}
			</div>
			<MenuChatDropdown info={info} changeTitle={changeTitle} handleExit={handleExit} key={`Dropdown_${info.chatid}`}/>
		</li>
	);
}