import { useState } from 'react';
// import '../../css/MenuChat.css';
import MenuChatBox from './MenuChatBox';
import { chatroom, ChatRoom, chathistory } from '../../socket/chatSocket';
import AddChatModal from '../modals/AddChatModal';
import PublicChatModal from '../modals/PublicChatModal'

export default function MenuChat(props :any){
    const [chatroomState, setChatroom] = useState(chatroom.chatroom);
   
    const handleTitleChange = (chatid :string, title :string) => {
        let chat:Array<ChatRoom> = chatroomState;

        const idx = chat.findIndex(room => room.chatid === chatid);
        // console.log(`idx = ${idx}`);
        if (idx !== -1){
            chat[idx].title = title;
            setChatroom(chat);
        }
    }
    const exitChatRoom = (chatid :string) =>{
        console.log('exitChatRoom!');
        setChatroom(chatroomState.filter(room=>room.chatid !== chatid));
		chatroom.chatroom.filter(room=> room.chatid !== chatid);
		chathistory.filter(history=>history.chatid !== chatid);
    }

    return (
        <div className='container' id='chatlist'>
            <div className='d-flex justify-content-end'>
                <button type='button' className='btn' data-toggle='modal' data-target='#AddChatModal'>
                    <i className="bi bi-chat"/>
                </button>
                <button type='button' className='btn' data-toggle='modal' data-target='#PublicChatModal'>
                    <i className="bi bi-unlock"/>
                </button>
            </div>
            <div className="m-1 h-90">
                <ul key='chatBoxList' className='col list-unstyled'>
                    {chatroomState.map(info => <MenuChatBox info={info} getIdx={props.getIdx} setTitle={handleTitleChange} exitChatRoom={exitChatRoom}/>)}
                </ul>
            </div>
            <AddChatModal></AddChatModal>
            <PublicChatModal></PublicChatModal>
        </div>
    );
}