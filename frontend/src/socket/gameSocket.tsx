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
export type playRoom = {
    roomid: string,
    score: number,
    player1: string,
    player2: string
}

export let roomId:string = "12222";
export function handleRoomId(id:string){
    roomId = id;
    console.log(roomId);
}

export let myGameRoom: gameRoomDetail = {
    title: 'hello1',
    roomid: '12222',
    manager: "123223",
    map:'1',
    observer: [{userid: "132943", nickname: "oberser1", profile: 3}, {userid: "1292943", nickname: "observer2", profile: 2}],
    type: 'Public',
    status: false,
    players:[{userid: "1232943", nickname: "player1", profile: 1}],
    isPlayer: true
};
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

export let playroom:playRoom = {
    roomid: '',
    score: 0,
    player1: '',
    player2: ''
};

socket.on('gameRoomList', (msg)=>{
    gameRoomList = msg;
});
socket.on('enterGameRoom', (msg)=>{
    console.log('enter game room');
    if (msg.message){
        alert('fail to enter the room!');
    }
    else{
        // myGameRoom = msg;
        handleRoomDetail(msg);
    }
});
socket.on('exitGameRoom', (msg)=>{
    console.log('exit game room');
    myGameRoom.title = '';
    myGameRoom.roomid = '';
    myGameRoom.manager = '';
    myGameRoom.map = '';
    myGameRoom.observer = [];
    myGameRoom.type = '';
    myGameRoom.status = false;
    myGameRoom.players = [];
    myGameRoom.isPlayer = false;
    console.log(myGameRoom);
    // window.location.reload();
})
socket.on('startGame', (msg)=>{
    console.log('start game!');
    if (msg.result){
        alert('failed to play the game!');
    }else{
        playroom.roomid = msg.roomid;
        playroom.score = msg.score;
        playroom.player1 = msg.player1;
        playroom.player2 = msg.player2;      
        window.location.href = `http://localhost:3000/game/play/${playroom.roomid}`;
    }
})