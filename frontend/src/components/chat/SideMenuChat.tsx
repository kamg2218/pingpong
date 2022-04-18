import { useEffect, useState } from 'react';
import { socket } from '../../socket/socket';
import { Switch, Route, Link, useParams } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { gameRoomDetail } from '../../types/gameTypes';
import { ChatData, ChatUser, InputChatRoom } from '../../types/chatTypes';
import { RootState } from '../../redux/rootReducer';
import { updateChat } from '../../redux/chatReducer';
import MenuChat from '../../components/chat/MenuChat';
import ChatRoom from '../../components/chat/ChatRoom';
import './chat.css';

type param = { id?: String }

export default function SideMenuChat(){
	const dispatch = useDispatch();
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	const chat = useState<ChatData>(chatroom);

	useEffect(()=>{
		console.log('sideMenuChat');
		socket.on('updateChatRoom', (data:InputChatRoom)=>{
			console.log('update Chat Room!');
			// console.log(data, chat[0]);
			let tmp:ChatData = chatroom;
			const idx = tmp.order.indexOf(data.chatid);
			if (data.title){ tmp.chatroom[idx].title = data.title; }
			if (data.type){ tmp.chatroom[idx].type = data.type; }
			if (data.addManager){ data.addManager.forEach((man:string)=>{
				let index:number = -1;
				index = tmp.chatroom[idx].manager?.findIndex((p:string)=>p === man);
				if (index === -1){ tmp.chatroom[idx].manager.push(man); }
			}); }
			if (data.deleteManager){ data.deleteManager.forEach(man=>tmp.chatroom[idx].manager = tmp.chatroom[idx].manager?.filter((person: string)=> man !== person)); }
			if (data.enterUser){ data.enterUser.forEach((user:ChatUser)=>{
				let index:number = -1;
				index = tmp.chatroom[idx].members.findIndex((p:ChatUser)=>p.userid===user.userid);
				if (index === -1){ tmp.chatroom[idx].members.push(user); }
			}); }
			if (data.exitUser){ data.exitUser.forEach(user=>tmp.chatroom[idx].members = tmp.chatroom[idx].members?.filter((person:ChatUser)=> user !== person.userid)); }
			if (data.switchOwner){ tmp.chatroom[idx].owner = data.switchOwner; }
			chat[1]({...tmp});
			dispatch(updateChat(tmp));
		});
		return ()=>{ socket.off('updateChatRoom'); }
	});

	const ChatRoomIdx = () => {
		let idx:param = useParams();
		return <ChatRoom idx={idx.id ? idx.id.toString():''} room={chatroom}></ChatRoom>
	}

	return (
		<div id='chatTab'>
			<div className='row'>
				<div className='col-3 btn' id='tab-game'>
					<Link to={`/game${gameroom.roomid !== '' ? `/waiting/${gameroom.roomid}`: ''}`} className='text-decoration-none text-reset'>game</Link>
				</div>
				<div className='col-3 btn' id='tab-chat-active'>
					<Link to={`/game/chat${gameroom.roomid !== '' ? `/waiting/${gameroom.roomid}`: ''}`} className='text-decoration-none text-reset'>chat</Link>
				</div>
			</div>
			<div className='row' id='nav-chat'>
				<Switch>
					<Route path='/game/chat/waiting/:id' component={MenuChat}></Route>
					<Route path='/game/chat/:id' component={ChatRoomIdx}></Route>
					<Route path='/game/chat' component={MenuChat}></Route>
				</Switch>
			</div>
		</div>
	);
}
