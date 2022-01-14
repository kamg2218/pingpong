import {useState, createContext} from 'react';

export const GameContext = createContext<any>(null);

export function GameVariables(){
	const [gameRoom, setGameRoom] = useState<gameRoomDetail>();
	const [roomList, setList] = useState<Array<gameRoom>>();
	const [playRoom, setPlayRoom] = useState<playRoom>();

	const variable = {
		room: [gameRoom, setGameRoom],
		roomlist: [roomList, setList],
		playroom: [playRoom, setPlayRoom],
	}
	return variable;
}

export type User = {
	userid: string,
	nickname: string,
	profile: number,
}
export type gameRoom = {
	title: string,
	roomid: string,
	map: string,
	player: number,
	observer: number,
	maxObserver: number,
	type: string,
	password: boolean,
	status: boolean
}
export type gameRoomDetail = {
	title: string,
	roomid: string,
	manager: string,
	map: string,
	observer: Array<User>,
	type: string,
	status: boolean,
	players: Array<User>,
	isPlayer: boolean
}
export type playRoom = {
	roomid: string,
	score: number,
	player1: string,
	player2: string
}

	// socket.on('gameRoomList', (msg)=>{
	// 	context.roomList[1](msg);
	// });
	// socket.on('enterGameRoom', (msg)=>{
	// 	console.log('enter game room');
	// 	if (msg.message){
	// 		alert('fail to enter the room!');
	// 	}
	// 	else{
	// 		context.gameRoom[1](msg);
	// 	}
	// });
	// socket.on('exitGameRoom', (msg)=>{
	// 	console.log('exit game room');
	// 	//or
	// 	// context.gameRoom[1](undefined);
	// 	context.gameRoom[1]({
	// 		title: '',
	// 		roomid: '',
	// 		manager: '',
	// 		map: '',
	// 		observer: [],
	// 		type: '',
	// 		status: false,
	// 		players: [],
	// 		isPlayer: false,
	// 	});
	// })
	// socket.on('startGame', (msg)=>{
	// 	console.log('start game!');
	// 	if (msg.result){
	// 		alert('failed to play the game!');
	// 	}else{
	// 		context.playroom[1]({
	// 			roomid: msg.roomid,
	// 			score: msg.score,
	// 			player1: msg.player1,
	// 			player2: msg.player2      
	// 		});
	// 		window.location.href = `http://localhost:3000/game/play/${msg.roomid}`;
	// 	}
	// })	
