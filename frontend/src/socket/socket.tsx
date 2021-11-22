import {io} from "socket.io-client";

const socket = io();
type Friend = {
    userid: string,
    nickname: string,
    profile: number,
    onoff?: boolean,
}
type History = {
    nickname: string,
    profile: number,
    winner: string,
}
type User = {
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
    history: Array<History>,
}

let user: User = {
    nickname: `${socket}`,
    win: 0,
    lose: 0,
    profile: 0,
    level: "",
    levelpoint: 0,
    levelnextpoint: 100,
    friends: [],
    newfriends: [],
    blacklist: [],
    history: [],
};

socket.on("userInfo", (data)=>{
    if (data.nickname)
        user.nickname = data.nickname;
    if (data.win)
        user.win = data.win;
    if (data.lose)
        user.lose = data.lose;
    if (data.profile)
        user.profile = data.profile;
    if (data.level)
        user.level = data.level;
    if (data.levelpoint)
        user.levelpoint = data.levelpoint;
    if (data.levelnextpoint)
        user.levelnextpoint = data.levelnextpoint;
    if (data.friends)
        user.friends = data.friends;
    if (data.newfriends)
        user.newfriends = data.newfriends;
    if (data.blacklist)
        user.blacklist = data.blacklist;
    if (data.history)
        user.history = data.history;
});
socket.on("newFriend", (data)=>{
    user.newfriends.push(data);
});
socket.on("addFriend", (data)=>{
    user.friends.push(data);
});
socket.on("deleteFriend", (data)=>{
    //userid 가 동일한 친구를 제거한다.
    user.friends = user.friends.filter(friend=>friend.userid !== data.userid);
});
socket.on("blockFriend", (data)=>{
    user.blacklist.push(data);
    //deleteFriend
    if (user.friends)
        user.friends = user.friends.filter(friend=>friend.userid !== data.userid);
});

export default socket;