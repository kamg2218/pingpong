import {socket} from './userSocket';

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

export let roomId:string = "12222";
export function handleRoomId(id:string){
    roomId = id;
    console.log(roomId);
}

export let myGameRoom: gameRoomDetail;
export function handleRoomDetail(detail:gameRoomDetail){
    myGameRoom = detail;
    console.log(myGameRoom);
}

export let gameRoomList: Array<gameRoom> = [
    {title: 'hello1', roomid: '12222', map:'1', observer: 2, type: 'Public', password: false, status: false, player:1, maxObserver:3},
    {title: 'hello2', roomid: '12272', map:'1', observer: 2, type: 'Public', password: false, status: false, player:2, maxObserver:5},
    {title: 'hello3', roomid: '12262', map:'1', observer: 2, type: 'Public', password: false, status: false, player:2, maxObserver:4},
    {title: 'hello4', roomid: '1252', map:'1', observer: 3, type: 'Private', password: true, status: false, player:1, maxObserver:5},
    {title: 'hello5', roomid: '17262', map:'1', observer: 2, type: 'Public', password: false, status: false, player:2, maxObserver:4},
    {title: 'hello6', roomid: '15752', map:'1', observer: 3, type: 'Private', password: true, status: false, player:1, maxObserver:5},
    {title: 'hello7', roomid: '12462', map:'1', observer: 2, type: 'Public', password: false, status: false, player:2, maxObserver:4},
    {title: 'hello8', roomid: '143352', map:'1', observer: 5, type: 'Private', password: true, status: false, player:1, maxObserver:5}
]

socket.on('gameRoomList', (msg)=>{
    gameRoomList = msg;
});
socket.on('enterGameRoom', (msg)=>{
    console.log('enter game room');
    if (msg.message){
        alert('fail to enter the room!');
    }
    else{
        myGameRoom = msg;
    }
});