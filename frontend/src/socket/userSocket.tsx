import {io} from "socket.io-client";
import {useState, createContext} from 'react'

export const socket = io("http://localhost:4242");

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
	qrcode?: string,
	history?: Array<History>
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

// export let user: User = {
//     id: "123223",
//     nickname: "first_user",
//     win: 3,
//     lose: 2,
//     profile: 1,
//     level: "",
//     levelpoint: 0,
//     levelnextpoint: 100,
//     friends: [{userid:'121', nickname: 'first', profile: 1, onoff: true}, {userid:'122', nickname: 'second', profile: 2, onoff: false}, {userid:'112', nickname: 'third', profile: 0, onoff: false},{userid:'111', nickname: 'forth', profile: 3, onoff: false},{userid:'101', nickname: 'fifth', profile: 4, onoff: false}, {userid:'2232', nickname: 'se3th', profile: 4, onoff: false}, {userid:'4253', nickname: 'fisdkesh', profile: 1, onoff: false}],
//     newfriends: [{userid:'1211111', nickname: 'newbie', profile: 2, onoff: false}],
//     blacklist: [],
//     qrcode: '',
//     // history: [],
// };

// export let user: User = {
// 	id: '',
// 	nickname: '',
// 	win: 0,
// 	lose: 0,
// 	profile: 1,
// 	level: "",
// 	levelpoint: 0,
// 	levelnextpoint: 100,
// 	friends: [],
// 	newfriends: [],
// 	blacklist: [],
// 	qrcode: '',
// };

// socket.on("userInfo", (data)=>{
// 	console.log("user Info is changed!");
// 	if (data.id)
// 		user.id = data.id;
// 	if (data.nickname)
// 		user.nickname = data.nickname;
// 	if (data.win)
// 		user.win = data.win;
// 	if (data.lose)
// 		user.lose = data.lose;
// 	if (data.profile)
// 		user.profile = data.profile;
// 	if (data.level)
// 		user.level = data.level;
// 	if (data.levelpoint)
// 		user.levelpoint = data.levelpoint;
// 	if (data.levelnextpoint)
// 		user.levelnextpoint = data.levelnextpoint;
// 	if (data.friends)
// 		user.friends = data.friends;
// 	if (data.newfriends)
// 		user.newfriends = data.newfriends;
// 	if (data.blacklist)
// 		user.blacklist = data.blacklist;
// 	if (data.qrcode)
// 		user.qrcode = data.qrcode;
// });
// socket.on("newFriend", (data)=>{
// 	user.newfriends.push(data);
// });
// socket.on("addFriend", (data)=>{
// 	user.friends.push(data);
// 	console.log('add friend!');
// });
// socket.on("deleteFriend", (data)=>{
// 	//userid 가 동일한 친구를 제거한다.
// 	user.friends = user.friends.filter(friend=>friend.userid !== data.userid);
// });
// socket.on("blockFriend", (data)=>{
// 	user.blacklist.push(data);
// });
// socket.on("updateProfile", (data)=>{
// 	if (data.nickname)
// 		user.nickname = data.nickname;
// 	if (data.profile)
// 		user.profile = data.profile;
// });
socket.on("opponentProfile", (data)=>{
	//친구 정보를 popup으로 보여줌!
});
//game
socket.on("matchRequest", (data)=>{
	//대전 신청 결과를 받음
	//대기 상태 종료
});
socket.on("matchResponse", (data)=>{
	//대전신청을 받음
	//popup 띄워서 수락 여부 결정해야 한다.
});
socket.on("qrcode", (data)=>{
	console.log('got qrcode!');
	console.log(data.qrcode);
	// user.qrcode = data.qrcode;
})