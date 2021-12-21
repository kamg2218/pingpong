import { useState, useRef } from "react";
import { Link } from 'react-router-dom'
import {socket, user} from '../../socket/userSocket';
import { chatroom, chathistory } from '../../socket/chatSocket';
import ChatBox from "./ChatBox";
import MyChatBox from "./MyChatBox";

//채팅방 입장 시, 히스토리 업데이트 필요함!
//각 주소 get으로 표시할 필요가 있음!

export default function ChatRoom(props :any){
    const [chat, setChat] = useState("");
    const chatInput = useRef<any>(null);
    const chatid = chatroom.order[props.idx];
    const history = chathistory.find(data => data.chatid === chatid);
    // const lastchat = `#${history?.list.length}`;

    console.log(props.idx);
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
    }
    const handleInputKeypress = (event:any) => {
        if (event.key === 'Enter'){
            handleSendBtn(event);
        }
    }

    return (
        <div className='h-100 p-2' key={`chatroom${props.idx}`}>
            <Link to='/game/chat' className='text-decoration-none text-reset m-1'><i className='bi bi-arrow-left'></i></Link>
            <div className="border h-75 overflow-scroll">
                {history?.list.map((data, idx)=>{
                    if (data.userid === user.id)
                        return <MyChatBox idx={idx} chatid={chatid} content={data.content}></MyChatBox>
                    else
                        return <ChatBox idx={idx} chatid={chatid} userid={data.userid} content={data.content}></ChatBox>
                })}
            </div>
            <form className='d-flex m-0 p-0 border' ref={chatInput}>
                <input className='col-10' onChange={(e)=>handleInputChange(e)} onKeyPress={handleInputKeypress}></input>
                <button className='btn btn-outline-dark col-2' onClick={handleSendBtn}><i className='bi bi-send'></i></button>
            </form>
        </div>
    );
}