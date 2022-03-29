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