import { useState } from 'react';
import '../../css/MenuChat.css';
import MenuChatBox from './MenuChatBox';
// import {user} from '../../socket/userSocket';
import { chatroom } from '../../socket/chatSocket';
import AddChatModal from '../modals/AddChatModal';
import { user } from '../../socket/userSocket';

//채팅방 추가 팝업으로 새로 만들어야 함!!!!

export default function MenuChat(props :any){
    // const [index, setIndex] = useState(chatroom.order.length);
    const [chatroomState, setChatroom] = useState(chatroom.chatroom);
    //[{idx:1, chatid:'1232', title:'', member:['a', 'b'], owner:'hello', lock: true}, {idx:2, chatid:'1212', title:'topic', member:['ac', 'bc', 'cd', 'ede'], owner:'u', lock:false}]
   
    //팝업으로 새로 만들어야 함!!!!
    const handleEnterChatRoom = () => {
        let tmpChatRoom = {
            title: "#",
            type: "private",
        };
        setChatroom(chatroom.chatroom);
        // setIndex(chatroom.order.length);
        //console.log(chatroom);
    }
    const handleTitleChange = (chatid :string, title :string) => {
        console.log('handleTitleChange!');
        const idx = chatroomState.findIndex(room => room.chatid === chatid);
        chatroomState[idx].title = title;
    }
    const exitChatRoom = (chatid :string) =>{
        console.log('exitChatRoom!');
        setChatroom(chatroomState.filter(room=>room.chatid !== chatid));
        // setChatroom(chatroom.chatroom);
    }

    return (
        <div className='container' id='chatlist'>
            <div className='d-flex justify-content-end'>
                {/* <button className='btn addChat' onClick={()=>{handleEnterChatRoom()}}><i className="bi bi-chat"/></button> */}
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