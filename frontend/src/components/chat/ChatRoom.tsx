import { useState, useRef } from "react";
import {socket} from '../../socket/userSocket';
import { chatroom } from '../../socket/chatSocket';

//채팅방 입장 시, 히스토리 업데이트 필요함!

export default function ChatRoom(props :any){
    const [chat, setChat] = useState("");
    const chatInput = useRef(null);

    const handleArrowClick = () => {
        props.getIdx(-1);
    }
    const handleInputChange = (e :any) => {
        setChat(e.target.value);
    }
    const handleSendBtn = (event:any) => {
        console.log(props.idx);
        const idx = props.idx;
        socket.emit("chatMessage", {
            chatid: chatroom.chatroom[idx].chatid,
            content: chat,
        }, (result:boolean)=>{
            if (result === false)
                alert('mute!!!');
        });
        console.log(chatInput.current);
        chatInput.current?.reset();
        setChat("");
        
    }
    const handleInputKeypress = (event:any) => {
        if (event.key === 'Enter'){
            handleSendBtn(event);
        }
    }

    return (
        <div className='border' id={props.idx}>
            <button className='btn m-2' onClick={()=>handleArrowClick()}><i className='bi bi-arrow-left'></i></button>
            <div className='border chatBox'>{chat}</div>
            <div className='d-flex'>
                <input className='col-10' onChange={(e)=>handleInputChange(e)} onKeyPress={handleInputKeypress} ref={chatInput}></input>
                <button className='btn btn-outline-dark col-2 p-1' onClick={handleSendBtn}><i className='bi bi-send'></i></button>
            </div>
        </div>
    );
}