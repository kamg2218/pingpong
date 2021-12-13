import { useState } from 'react';
import '../../css/MenuChat.css';
import MenuChatBox from './MenuChatBox';
import { chatroom, ChatRoom } from '../../socket/chatSocket';
import AddChatModal from '../modals/AddChatModal';

export default function MenuChat(props :any){
    const [chatroomState, setChatroom] = useState(chatroom.chatroom);
   
    const handleTitleChange = (chatid :string, title :string) => {
        let chat:Array<ChatRoom> = chatroomState;

        // console.log(chatid);
        const idx = chat.findIndex(room => room.chatid === chatid);
        console.log(`idx = ${idx}`);
        if (idx !== -1){
            chat[idx].title = title;
            setChatroom(chat);
        }
    }
    const exitChatRoom = (chatid :string) =>{
        console.log('exitChatRoom!');
        setChatroom(chatroomState.filter(room=>room.chatid !== chatid));
        // setChatroom(chatroom.chatroom);
    }

    return (
        <div className='container' id='chatlist'>
            <div className='d-flex justify-content-end'>
                <button type='button' className='btn' data-toggle='modal' data-target='#AddChatModal'>
                    <i className="bi bi-chat"/>
                </button>
            </div>
            <ul key='chatBoxList' className='col'>
                {chatroomState.map(info => <MenuChatBox info={info} getIdx={props.getIdx} setTitle={handleTitleChange} exitChatRoom={exitChatRoom}/>)}
            </ul>
            <AddChatModal></AddChatModal>
        </div>
    );
}