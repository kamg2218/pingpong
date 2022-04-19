import { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { socket } from '../../socket/socket';
import { RootState } from '../../redux/rootReducer';
import { updateChat } from '../../redux/chatReducer';
import { chatRoom, ChatData } from '../../types/chatTypes';
import MenuChatBox from './MenuChatBox';
import AddChatModal from '../modals/AddChatModal';
import PublicChatModal from '../modals/PublicChatModal';
import PwdModal from '../modals/PwdModal';
import InviteModal from '../modals/InviteModal';
import MuteModal from '../modals/MuteModal';
import ManagerModal from '../modals/ManagerModal';

export default function MenuChat(){
	const dispatch = useDispatch();
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	const [room, setRoom] = useState<ChatData>(chatroom);
	const [info, setInfo] = useState<chatRoom>(room.chatroom[0]);

	useEffect(()=>{
		// console.log('MenuChat');
		socket.on('enterChatRoom', (data:chatRoom)=>{
			// console.log('enter chat room!!');
			const tmp:ChatData = chatroom;
			if (tmp.order.indexOf(data.chatid) === -1){
				tmp.order.push(data.chatid);
				tmp.chatroom.push(data);
				setRoom({...tmp});
				dispatch(updateChat(tmp));
			}
		});
		socket.on('myChatRoom', (data:ChatData)=>{
			// console.log('my chat room!!');
			setRoom(data);
			dispatch(updateChat(data));
		});
		return ()=>{
			socket.off('enterChatRoom');
			socket.off('myChatRoom');
		}
	}, [chatroom, dispatch, room]);

	const handlePublic = () => {
		socket.emit('publicChatRoom');
	}
	const handleExit = (id: string) => {
		// console.log('exitChatRoom');
		const tmp:ChatData = room;
		tmp.order = tmp.order.filter((str:string) => str !== id);
		tmp.chatroom = tmp.chatroom.filter((room:chatRoom) => room.chatid !== id);
		setRoom({...tmp});
		dispatch(updateChat(tmp));
	}

	return (
		<div key='menuchat' className='container' id='menuChatList'>
			<div className='d-flex justify-content-end my-2'>
				<button type='button' className='btn' id='chatButton' data-toggle='modal' data-target='#addChatModal'><i className='bi bi-chat'/></button>
				<button type='button' className='btn' id='chatButton' data-toggle='modal' data-target='#publicChatModal' onClick={handlePublic}><i className='bi bi-unlock'/></button>
			</div>
			<div id='chatBoxList'>
				<ul id='chatBoxUl' className='col'>
					{room && room.chatroom?.map((info:chatRoom) => <MenuChatBox info={info} handleExit={handleExit} setInfo={setInfo} key={`MenuChatBox_${info.chatid}`}/>)}
				</ul>
			</div>
			<AddChatModal></AddChatModal>
			<PublicChatModal></PublicChatModal>
			<PwdModal info={info}></PwdModal>
			<InviteModal info={info}></InviteModal>
			<MuteModal info={info}></MuteModal>
			<ManagerModal info={info}></ManagerModal>
		</div>
	);
}