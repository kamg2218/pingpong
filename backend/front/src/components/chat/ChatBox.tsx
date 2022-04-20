import { shallowEqual, useSelector } from 'react-redux';
import { ChatBlock, ChatData, chatRoom } from '../../types/chatTypes';
import { RootState } from '../../redux/rootReducer';
import Profile from '../../icons/Profile';
import { socket } from '../../socket/socket';

export default function ChatBox({idx, chatid, data}:{idx:number, chatid:string, data:ChatBlock}){
	const chatRoom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	const room = chatRoom.chatroom.find((data:chatRoom) => data.chatid === chatid);
	const member = room?.members.find(person => person.userid === data.userid);
	
	const makeTime = () => {
		if (!data || !data.createDate){ return '00:00'; }
		let date:Date = new Date(data.createDate);
		// console.log(`time = ${date}, ${typeof date}`);
		const hour = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return (`${hour}:${minutes}`);
	}
	const handleProfileClick = () => {
		socket.emit('opponentProfile', { userid: data?.userid });
	}

	return (
		<div className='container p-0' key={`${chatid}chatbox${idx}`} id={idx.toString()}>
			<div className='row align-items-start' data-toggle='modal' data-target='#profileModal' onClick={handleProfileClick}>
				<img src={Profile(member?.profile ? member.profile : 0)} className='col-2 rounded-circle m-1' alt='...'/>
				<div className='col'>
					<div className='row col-12'>{member ? member.nickname : 'unknown'}</div>
					<div className='row col-12' id='chatboxcontent'>{data.contents}</div>
					<div className='row col-12 small text-muted'>{makeTime()}</div>
				</div>
			</div>
		</div>
	);
}