import {useState, createContext} from 'react';

export const UserContext = createContext<any>(null);

export function UserVariables(){
	const [user, setUser] = useState<User>();
	const variable = {
		user: [user, setUser],
	};
	return variable;
}

export type Friend = {
	userid: string,
	nickname: string,
	profile: number,
	onoff: boolean,
}
export type History = {
	nickname: string,
	profile: number,
	winner: string,
}
export type User = {
	userid: string,
	nickname: string,
	win: number,
	lose: number,
	profile: number,
	level: string,
	levelpoint: number,
	levelnextpoint: number,
	friends: Array<Friend>,
	newfriends: Array<Friend>,
	blacklist: Array<Friend>,
	qrcode: string,
	history: Array<History>,
	twofactor: boolean,
}
export type ProfileUser = {
	userid: string,
	nickname: string,
	win: number,
	lose: number,
	profile: number,
	level: string,
	history: Array<History>,
	block: boolean,
	friend: boolean
}