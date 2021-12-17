import {socket} from './userSocket';

export type User = {
    userid: string,
    nickname: string,
    profile: number,
}
export type ChatRoom = {
    title: string,
    chatid: string,
    owner: string,
    manager: Array<string>,
    members: Array<User>,
    lock: boolean,
    type: string,
    max: number,
}
export type InputChatRoom = {
    chatid: string,
    title: string,
    addManager: Array<string>,
    deleteManager: Array<string>,
    enterUser: Array<User>,
    exitUser: Array<string>,
    lock: boolean,
    type: string,
}
export type ChatData = {
    order: Array<string>,
    chatroom: Array<ChatRoom>,
}
export type ChatBlock = {
    userid: string,
    content: string,
}
export type ChatHistory = {
    chatid: string,
    list: Array<ChatBlock>,
}

export let chatroom:ChatData = {
    order: ['1232', '1233424'],
    chatroom: [{chatid:'1232', title:'', manager:['123223'], members:[{userid: '2535', nickname:'second_user', profile:2}], owner:'123223', lock: false, max:10, type: "private"}, {chatid:'1233424', title:'', manager:['2535'], members:[{userid: '2535', nickname:'third_user', profile:2}], owner:'2535', lock: false, max:10, type: "private"}]
};
export let publicchatroom:ChatData;
export let chathistory:Array<ChatHistory> = [{chatid: '1232', list:[{userid: '123223', content: "hello, nice to meet you!"}, {userid: '2535', content: "I'm in!"}, {userid: '123223', content: "I'm out!"},{userid: '123223', content: "hello, nice to meet you!"}, {userid: '2535', content: "I'm in!"}, {userid: '123223', content: "I'm out!"},{userid: '123223', content: "hello, nice to meet you!"}, {userid: '2535', content: "I'm in!"}, {userid: '123223', content: "I'm out!"}]}, {chatid:'1233424', list:[]}];

socket.on('myChatRoom', (data:ChatData)=>{
    chatroom = data;
});
socket.on('publicChatRoom', (data:ChatData)=>{
    publicchatroom = data;
    // console.log(data);
    // console.log(publicchatroom);
});
socket.on('enterChatRoom', (data:ChatRoom)=>{
    chatroom.order.push(data.chatid);
    chatroom.chatroom.push(data);
});
socket.on('updateChatRoom', (data:InputChatRoom)=>{
    const idx = chatroom.order.indexOf(data.chatid);
    if (data.title)
        chatroom.chatroom[idx].title = data.title;
    if (data.lock)
        chatroom.chatroom[idx].lock = data.lock;
    if (data.type)
        chatroom.chatroom[idx].type = data.type;
    if (data.addManager)
        data.addManager.map(man=>chatroom.chatroom[idx].manager.push(man));
    if (data.deleteManager)
        data.deleteManager.map(man=>chatroom.chatroom[idx].manager.filter(person=> man !== person));
    if (data.enterUser)
        data.enterUser.map(user=>chatroom.chatroom[idx].members.push(user));
    if (data.exitUser)
        data.exitUser.map(user=>chatroom.chatroom[idx].members.filter(person=> user !== person.userid));
});
socket.on('chatHistory', (data:ChatHistory)=>{
    const idx = chathistory.findIndex((id)=> id.chatid === data.chatid);
    if (idx === -1){
        chathistory.push(data);
    }else{
        chathistory[idx].list = data.list;
    }
});
socket.on('chatHistoryUpdate', (data:ChatHistory)=>{
    const idx = chathistory.findIndex((id)=> id.chatid === data.chatid);
    if (idx === -1)
        alert(Error!);
    else
        data.list.map(lst => chathistory[idx].list.push(lst));
});
