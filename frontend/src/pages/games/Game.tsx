import '../../css/Game.css'
import SideMenuChat from './SideMenuChat'
import SideMenuGame from './SideMenuGame'
import WaitingRoom from './WaitingRoom'
import Lobby from './Lobby'
import { Route, Switch } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom';
import { socket, UserContext, User } from '../../socket/userSocket'
import { GameContext, GameUser } from '../../socket/gameSocket'

export default function Game() {
	const history = useHistory();
	const gameContext = useContext(GameContext);
	const userContext = useContext(UserContext);
	const [user, setUser] = useState<User>(userContext.user[0]);

	useEffect(() => {
		if (!user) {
			socket.emit("userInfo");
			console.log('user info !!!');
			socket.emit("myChatRoom");
		}
	}, [user, userContext, gameContext]);
	socket.on("userInfo", (data) => {
		console.log("user Info is changed!");
		if (!user) {
			setUser(data);
		} else if (data.id) {
			user.id = data.id;
		} else if (data.nickname) {
			user.nickname = data.nickname;
		} else if (data.win) {
			user.win = data.win;
		} else if (data.lose) {
			user.lose = data.lose;
		} else if (data.profile) {
			user.profile = data.profile;
		} else if (data.level) {
			user.level = data.level;
		} else if (data.levelpoint) {
			user.levelpoint = data.levelpoint;
		} else if (data.levelnextpoint) {
			user.levelnextpoint = data.levelnextpoint;
		} else if (data.friends) {
			user.friends = data.friends;
		} else if (data.newfriends) {
			user.newfriends = data.newfriends;
		} else if (data.blacklist) {
			user.blacklist = data.blacklist;
		}
		userContext.user[1](user);
	});
	socket.on("enterGameRoom", (msg) => {
		console.log('enter game room');
		console.log(msg);
		if (msg.message) {
			console.log(msg.message);
			alert('fail to enter the room!');
		}
		else {
			console.log('entered!')
			gameContext.gameroom[1](msg);
		}
	});
	socket.on("exitGameRoom", (msg) => {
		console.log(msg);
		gameContext.gameroom[1](undefined);
	});
	socket.on('startGame', (msg) => {
		console.log('start game!');
		if (msg.result) {
			alert('failed to play the game!');
		} else {
			gameContext.playroom[1](msg);
			history.push(`/game/play/${msg.roomid}`);
		}
	});
	socket.on('updateGameRoom', (msg) => {
		if (msg.manager) {
			gameContext.gameroom[0].manager = msg.manager;
		}
		if (msg.title) {
			gameContext.gameroom[0].title = msg.title;
		}
		if (msg.speed) {
			gameContext.gameroom[0].speed = msg.speed;
		}
		if (msg.status) {
			gameContext.gameroom[0].status = msg.status;
		}
		if (msg.type) {
			gameContext.gameroom[0].type = msg.type;
		}
		if (msg.addObserver) {
			msg.addObserver.forEach((observer: GameUser) => gameContext.gameroom[0].oberserver.push(observer))
		}
		if (msg.deleteObserver) {
			msg.deleteObserver.forEach((observer: GameUser) => gameContext.gameroom[0].observer.filter((ob: GameUser) => ob.userid === observer.userid))
		}
		if (msg.addPlayers) {
			msg.addPlayers.forEach((player: GameUser) => gameContext.gameroom[0].players.push(player))
		}
		if (msg.deletePlayers) {
			msg.deletePlayers.forEach((player: GameUser) => gameContext.gameroom[0].players.filter((person: GameUser) => person.userid === player.userid))
		}
	});
	return (
		<div className="container-fluid m-0 p-0 min-vh-100 min-vw-100" id="gamelobby">
			<div className='col'>
				<h1 className='row justify-content-center' id='gameHeader'>PONG CONTEST GAME</h1>
				<div className='mx-1 row'>
					<div className='col-xs-10 col-md-4 col-lg-3 d-sm-none d-md-block h-75'>
						<Switch>
							<Route path='/game/chat'><SideMenuChat /></Route>
							<Route path='/game'><SideMenuGame /></Route>
						</Switch>
					</div>
					<div className='d-none d-sm-block col'>
						<Switch>
							<Route path='/game/waiting/:id'><WaitingRoom /></Route>
							<Route path='/game/chat/waiting/:id'><WaitingRoom /></Route>
							<Route path='/game' component={Lobby}></Route>
						</Switch>
					</div>
				</div>
			</div>
		</div>
	);
}