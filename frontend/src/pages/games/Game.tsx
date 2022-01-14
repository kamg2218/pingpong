import '../../css/Game.css'
import SideMenuChat from '../../components/chat/SideMenuChat'
import SideMenuGame from './SideMenuGame'
import WaitingRoom from './WaitingRoom'
import Lobby from './Lobby'
import { Route, Switch } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { socket, User, UserContext} from '../../socket/userSocket'
import {GameContext} from '../../socket/gameSocket'

export default function Game(){
	const gameContext = useContext(GameContext);
	const userContext = useContext(UserContext);
	const [user, setUser] = useState<User>(userContext.user[0]);
	
	useEffect(()=>{
		if (!user){
			socket.emit("userInfo");
			console.log('user info !!!');
			socket.emit("myChatRoom");
		}
	}, [user, gameContext]);
	socket.on("userInfo", (data)=>{
		console.log("user Info is changed!");
		if (!user){
			setUser(data);
		}else if (data.id){
			user.id = data.id;
		}else if (data.nickname){
			user.nickname = data.nickname;
		}else if (data.win){
			user.win = data.win;
		}else if (data.lose){
			user.lose = data.lose;
		}else if (data.profile){
			user.profile = data.profile;
		}else if (data.level){
			user.level = data.level;
		}else if (data.levelpoint){
			user.levelpoint = data.levelpoint;
		}else if (data.levelnextpoint){
			user.levelnextpoint = data.levelnextpoint;
		}else if (data.friends){
			user.friends = data.friends;
		}else if (data.newfriends){
			user.newfriends = data.newfriends;
		}else if (data.blacklist){
			user.blacklist = data.blacklist;
		}
		userContext.user[1](user);
	});
	socket.on("enterGameRoom", (msg)=>{
		console.log('enter game room');
		if (msg.message){
			alert('fail to enter the room!');
		}
		else{
			gameContext.room[1](msg);
			//gameRoom State가 필요한가?
		}
	});
	socket.on("exitGameRoom", (msg)=>{
		console.log(msg);
		gameContext.room[1](undefined);
	});
	return (
		<div className="container-fluid m-0 p-0 min-vh-100 min-vw-100" id="gamelobby">
			<div className='col'>
				<h1 className='row justify-content-center' id='gameHeader'>PONG CONTEST GAME</h1>
				<div className='mx-1 row'>
					<div className='col-xs-10 col-md-4 col-lg-3 d-sm-none d-md-block h-75'>
						<Switch>
							<Route path='/game/chat'><SideMenuChat/></Route>
							<Route path='/game'><SideMenuGame/></Route>
						</Switch>
					</div>
					<div className='d-none d-sm-block col'>
						{!gameContext.room[0]?.roomid ? <Lobby/> : <WaitingRoom/>}
					</div>
				</div>
			</div>
		</div>
	);
}