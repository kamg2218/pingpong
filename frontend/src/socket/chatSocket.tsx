import {socket} from './socket';

export type ChatRoom = {
    title: string,
    chatid: string,
    owner: string,
    manager: Array<string>,
    members: Array<string>,
    lock: boolean,
    type: string,
    max: number,
};

export type ChatData = {
    order: Array<string>,
    chatroom: Array<ChatRoom>,
}

export let chatroom:ChatData;
export let publicchatroom:ChatData;

socket.on('myChatRoom', (data:ChatData)=>{
    chatroom = data;
});
socket.on('publicChatRoom', (data:ChatData)=>{
    publicchatroom = data;
});
socket.on('enterChatRoom', (data:ChatRoom)=>{
    chatroom.order.push(data.chatid);
    chatroom.chatroom.push(data);
});
socket.on('updateChatRoom', (data)=>{
    const idx = chatroom.order.indexOf(data.chatid);
    if (data.title)
        chatroom.chatroom[idx].title = data.title;
    if (data.lock)
        chatroom.chatroom[idx].lock = data.lock;
    if (data.type)
        chatroom.chatroom[idx].type = data.type;
    if (data.addManager)
        chatroom.chatroom[idx].manager.push(data.addManager);
});