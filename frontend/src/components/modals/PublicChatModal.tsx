import { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {socket} from '../../socket/socket';
import { RootState } from '../../redux/rootReducer';
import { updatePublic } from '../../redux/chatReducer';
import { ChatData, ChatRequest, chatRoom } from '../../types/chatTypes';
import PublicChatList from '../chat/PublicChatList';

export default function PublicChatModal(){
	const dispatch = useDispatch();
	const [pwd, setPwd] = useState<string>('');
	const [checkedroom, checkRoom] = useState<string>('');
	const publicroom:ChatData = useSelector((state:RootState) => state.chatReducer.publicroom, shallowEqual);

	useEffect(() => {
		socket.on('publicChatRoom', (data:ChatData)=>{
			// console.log('public chat room on!');
			dispatch(updatePublic(data));
		})
		return ()=>{socket.off('publicChatRoom');}
	}, [pwd, checkedroom, publicroom, dispatch]);

	const handleSubmit = () => {
		let data:ChatRequest = {
			chatid: checkedroom
		};
		if (pwd){
			data.password = pwd;
		}
		socket.emit('enterChatRoom', data);
	}

	return (
		<div className='modal fade h-8' id='publicChatModal' role='dialog' tabIndex={-1} aria-labelledby='PublicChatModalLabel' aria-hidden='true'>
			<div className='modal-dialog modal-dialog-centered' role='document'>
				<div className='modal-content'>
					<div className='modal-header'>
						<h5 id='PublicChatModalLabel' className='modal-title'>공개 채팅방</h5>
						<button type='button' className='btn modal-button' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>
					</div>
					<div className='modal-body'>
						<div className='container p-0'>
							<div className='row overflow-scroll justify-content-center'>
								{publicroom &&  publicroom.chatroom.map((room:chatRoom)=> <PublicChatList chatroom={room} setPwd={setPwd} checkRoom={checkRoom} handleSubmit={handleSubmit}/>)}
							</div>
						</div>
					</div>
					<div className='modal-footer'>
						<button type='button' className='btn modal-button' data-dismiss='modal' onClick={handleSubmit}>확인</button>
						<button type='button' className='btn modal-button' data-dismiss='modal'>취소</button>
					</div>
				</div>
			</div>
		</div>
	);
}