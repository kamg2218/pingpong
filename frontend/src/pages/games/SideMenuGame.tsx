import '../../css/Game.css';
import MenuGame from '../../components/games/MenuGame'
import { Link } from 'react-router-dom'
import {useState, useContext, useEffect} from 'react'
import {User, socket, UserContext, Friend} from '../../socket/userSocket';
import { GameContext } from '../../socket/gameSocket';
import ProfileModal from '../../components/modals/ProfileModal';
import MyProfileModal from '../../components/modals/MyProfileModal';

export default function SideMenuGame(){
	const gameContext = useContext(GameContext);
	const userContext = useContext(UserContext);
	const [info, setInfo] = useState<User>(userContext.user[0]);
	const [clicked, setClicked] = useState<string>("");

	useEffect(()=>{
		socket.on("newFriend", (data)=>{
			userContext.user[0]?.newfriends?.push(data);
			info.newfriends.push(data);
		});
		socket.on("addFriend", (data)=>{
			userContext.user[0]?.friends?.push(data);
			info.friends?.push(data);
			console.log('add friend!');
		});
		socket.on("deleteFriend", (data)=>{
			//userid 가 동일한 친구를 제거한다.
			if (userContext){
				userContext.user[0].friends = userContext.user[0].friends.filter((friend:Friend)=>friend.userid !== data.userid);
			}
			info.friends = info.friends.filter((one:Friend)=>one.userid !== data.userid);
		});
		socket.on("blockFriend", (data)=>{
			userContext.user[0].blacklist.push(data);
			info.blacklist.push(data);
		});
		socket.on("updateProfile", (data)=>{
			if (data.nickname){
				userContext.user[0].nickname = data.nickname;
				info.nickname = data.nickname;
			}
			if (data.profile){
				userContext.user[0].profile = data.profile;
				info.profile = data.profile;
			}
		});
	}, [userContext, info]);
	return (
		<div id='gameTab'>
			<div className='row'>
				<div className='col-3 btn border border-bottom-0 rounded-top bg-light' id='tab-game'>
					<Link to={`/game${gameContext.gameroom[0] ? `/waiting/${gameContext.gameroom[0].roomid}`: ''}`} className='text-decoration-none text-reset'>game</Link>
				</div>
				<div className='col-3 btn border border-bottom-0 rounded-top' id='tab-chat'>
					<Link to={`/game/chat${gameContext.gameroom[0] ? `/waiting/${gameContext.gameroom[0].roomid}`: ''}`} className='text-decoration-none text-reset'>chat</Link>
				</div>
			</div>
			<div className='row border-top' id='nav-game'>
				<MenuGame setClicked={setClicked}></MenuGame>
			</div>
			<MyProfileModal setClicked={setClicked}/>
			<ProfileModal userid={clicked}/>
		</div>
	);
}