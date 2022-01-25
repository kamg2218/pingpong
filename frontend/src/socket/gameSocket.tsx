import {useState, createContext} from 'react';

export const GameContext = createContext<any>(null);

export function GameVariables(){
	const [gameRoom, setGameRoom] = useState<gameRoomDetail>();
	const [roomList, setList] = useState<Array<gameRoom>>();
	const [playRoom, setPlayRoom] = useState<playRoom>();
	const [draw, setDraw] = useState<draw>({
		background: {
			width: 480,
			height: 320
		},
		ball: {
			x: 100,
			y: 100,
			z: 50,
		},
		right: {
			x: 10,
			y: 5,
			width: 2,
			height: 3,
			score: 2
		},
		left: {
			x: 1,
			y: 5,
			width: 2,
			height: 3,
			score: 1
		}
	});

	const variable = {
		gameroom: [gameRoom, setGameRoom],
		gameroomlist: [roomList, setList],
		playroom: [playRoom, setPlayRoom],
		draw: [draw, setDraw],
	}
	return variable;
}

export type GameUser = {
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
	observer: Array<GameUser>,
	type: string,
	status: boolean,
	players: Array<GameUser>,
	isPlayer: boolean
}
export type playRoom = {
	roomid: string,
	score: number,
	player1: string,
	player2: string
}
export type move = {
	roomid: string,
	direction: string
}
export type draw = {
	background: {
		width: number,
		height: number
	},
	ball: {
		x: number,
		y: number,
		z: number,
	},
	right: {
		x: number,
		y: number,
		width: number,
		height: number,
		score: number
	},
	left: {
		x: number,
		y: number,
		width: number,
		height: number,
		score: number
	}
}