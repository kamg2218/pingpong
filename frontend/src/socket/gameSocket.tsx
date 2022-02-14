import {useState, createContext} from 'react';

export const GameContext = createContext<any>(null);

export function GameVariables(){
	const [gameRoom, setGameRoom] = useState<gameRoomDetail>();
	const [roomList, setList] = useState<Array<gameRoom>>();
	const [playRoom, setPlayRoom] = useState<playRoom>();
	const [winner, setWinner] = useState<string>();
	const [draw, setDraw] = useState<draw>({
		background: {
			width: 480,
			height: 320
		},
		ball: {
			x: 100,
			y: 100,
			r: 10,
		},
		right: {
			x: 20,
			y: 200,
			width: 10,
			height: 100,
			score: 2
		},
		left: {
			x: 300,
			y: 200,
			width: 10,
			height: 100,
			score: 1
		}
	});

	const variable = {
		gameroom: [gameRoom, setGameRoom],
		gameroomlist: [roomList, setList],
		playroom: [playRoom, setPlayRoom],
		draw: [draw, setDraw],
		winner: [winner, setWinner],
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
	speed: number,
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
	speed: number,
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
		r: number,
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
export type match = {
	userid : string,
	nickname : string,
	requestid : string
}