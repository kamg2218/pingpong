import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {socket} from '../../socket/socket';
import { User } from '../../types/userTypes';
import { ChatBlock, ChatData, ChatHistory } from '../../types/chatTypes';
import { RootState } from '../../redux/rootReducer';
import { historyInitalState, updateHistory } from '../../redux/chatReducer';
import ChatBox from './ChatBox';
import MyChatBox from './MyChatBox';
import './ChatRoom.css';

//chat 길이 확인!

export default function ChatRoom({idx, room}:{idx:string, room:ChatData}){
	const dispatch = useDispatch();
	const _history = useHistory();
	const [chat, setChat] = useState('');
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);
	const chatid:string = room?.order[Number(idx)];
	const history:ChatHistory = useSelector((state:RootState) => state.chatReducer.history, shallowEqual);
	const [chatHistory, setHistory] = useState<ChatHistory>(history);

	useEffect(()=>{
		if (!chatid){
			const path: string = _history.location.pathname;
			const id: number = path.search('chat');
			let tmp: string = path.slice(0, id + 4);
			const num: number = path.indexOf('/', id + 6);
			if (num !== -1) {
				tmp += path.slice(num);
			}
			_history.replace(tmp);
		}
		socket.on('chatHistory', (data:ChatHistory)=>{
			// console.log('chatHistroy on!', data);
			setHistory(data);
			dispatch(updateHistory(data));
		});
		socket.on('chatMessage', (data:any)=>{
			const hisChat:ChatHistory = chatHistory;
			if (hisChat.chatid === data.chatid){
				// console.log('got chat message');
				// console.log(data);
				if (data.result){
					// console.log(data.result);
					return ;
				}
				hisChat.list.push({
					userid: data.userid,
					contents: data.contents,
					createDate: data.createDate,
				});
				setHistory({...hisChat});
				dispatch(updateHistory(hisChat));
			}
		});
		return ()=>{
			socket.off('chatMessage');
			socket.off('chatHistory');
		}
	}, [chatid, dispatch, chatHistory, chat, _history]);

	const handleInputChange = (e :any) => { setChat(e.target.value); }
	const handleSendBtn = () => {
		if (chat === ''){
			return ;
		}
		// console.log('chatMessage emit!');
		socket.emit('chatMessage', {
			chatid: chatid,
			contents: chat,
		}, (result:boolean)=>{
			if (result === false){
				alert('mute!!!');
				return ;
			}
		});
		setChat('');
	}
	const handleInputKeypress = (event:any) => {
		if (event.key === 'Enter'){
			event.preventDefault();
			handleSendBtn();
		}
	}
	const handleUrl = () => {
		const url:string = _history.location.pathname;
		const idx:number = url.search('waiting');
		
		socket.emit('myChatRoom');
		if (idx !== -1){
			let result:string = url.slice(0, url.search('chat') + 5);
			result += url.slice(idx);
			_history.push(result);
		}else{
			_history.push('/game/chat');
		}
		dispatch(updateHistory(historyInitalState));
		setHistory(historyInitalState);
	}

	return (
		<div className='container-fluid p-2 h-100' key={`chatroom${idx}`}>
			<div className='col h-100'>
				<div className='row m-1 mt-2' onClick={handleUrl}><i className='bi bi-arrow-left' id='leftArrow'></i></div>
				<div className='row m-0 mt-3' id='chatlist'>
					<div className='col my-1'>
						{chatHistory && chatHistory.list?.map((data:ChatBlock, idx:number)=>{
							// console.log(`idx = ${idx}, data = ${data}`);
							if (data.userid === user.userid){
								return <MyChatBox idx={idx} chatid={chatid} data={data} key={idx}></MyChatBox>
							}else{
								return <ChatBox idx={idx} chatid={chatid} data={data} key={idx}></ChatBox>
							}})}
					</div>
				</div>
				<div className='row d-flex m-0 mt-1 p-0' id='chatForm'>
					<input className='d-none' type='password'></input>
					<input className='col' id='chatInput' value={chat} onChange={handleInputChange} onKeyPress={handleInputKeypress} autoFocus></input>
					<button className='col-2' id='chatSend' onClick={handleSendBtn}><i className='bi bi-play'/></button>
				</div>
			</div>
		</div>
	);
}