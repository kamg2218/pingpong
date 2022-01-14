import '../../css/Game.css';
import MenuGame from '../../components/games/MenuGame'
import { Link } from 'react-router-dom'
import {useContext, useEffect} from 'react'
import {socket, UserContext, Friend} from '../../socket/userSocket';

export default function SideMenuGame(){
	const userContext = useContext(UserContext);

	useEffect(()=>{

	}, [userContext]);
	socket.on("newFriend", (data)=>{
		userContext.user[0].newfriends.push(data);
	});
	socket.on("addFriend", (data)=>{
		userContext.user[0].friends.push(data);
		console.log('add friend!');
	});
	socket.on("deleteFriend", (data)=>{
		//userid 가 동일한 친구를 제거한다.
		userContext.user[0].friends = userContext.user[0].friends.filter((friend:Friend)=>friend.userid !== data.userid);
	});
	socket.on("blockFriend", (data)=>{
		userContext.user[0].blacklist.push(data);
	});
	socket.on("updateProfile", (data)=>{
		if (data.nickname)
			userContext.user[0].nickname = data.nickname;
		if (data.profile)
			userContext.user[0].profile = data.profile;
	});
	return (
		<div id='gameTab'>
			<div className='row'>
				<div className='col-3 btn border border-bottom-0 rounded-top bg-light' id='tab-game'>
					<Link to='/game' className='text-decoration-none text-reset'>game</Link>
				</div>
				<div className='col-3 btn border border-bottom-0 rounded-top' id='tab-chat'>
					<Link to='/game/chat' className='text-decoration-none text-reset'>chat</Link>
				</div>
			</div>
			<div className='row border-top' id='nav-game'>
				<MenuGame></MenuGame>
			</div>
		</div>
	);
}