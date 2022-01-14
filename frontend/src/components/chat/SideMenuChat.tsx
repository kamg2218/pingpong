import '../../css/Game.css';
import MenuChat from '../../components/chat/MenuChat'
import ChatRoom from '../../components/chat/ChatRoom'
import { Switch, Route, Link, useParams } from 'react-router-dom'
import {useState, useEffect, useContext} from 'react'
import {chatRoom} from '../../socket/chatSocket'
import { socket, UserContext } from '../../socket/userSocket';

type param = {
	id?: String
}

export default function SideMenuChat(){
	const userContext = useContext(UserContext);
	const [info, setInfo] = useState<chatRoom>();
	
	useEffect(()=>{
		console.log('side menu chat');
		socket.emit("myChatRoom");
	}, [info]);
	function ChatRoomIdx(){
		let idx:param = useParams();
		return <ChatRoom idx={idx.id}></ChatRoom>
	}

	return (
		<div id='chatTab'>
			<div className='row'>
				<div className='col-3 btn border border-bottom-0 rounded-top' id='tab-game'>
					<Link to='/game' className='text-decoration-none text-reset'>game</Link>
				</div>
				<div className='col-3 btn border border-bottom-0 rounded-top bg-light' id='tab-chat'>
					<Link to='/game/chat' className='text-decoration-none text-reset'>chat</Link>
				</div>
			</div>
			<div className='row border-top' id='nav-chat'>
				<Switch>
					<Route exact path='/game/chat/:id'><ChatRoomIdx/></Route>
					<Route path='/game/chat'><MenuChat/></Route>
				</Switch>
			</div>
		</div>
	);
}