import { useState, useRef } from "react";
import {socket, user} from '../../socket/userSocket';
import { chatroom, chathistory } from '../../socket/chatSocket';
import ChatBox from "./ChatBox";
import MyChatBox from "./MyChatBox";

//채팅방 입장 시, 히스토리 업데이트 필요함!

export default function ChatRoom(props :any){
    const [chat, setChat] = useState("");
    const chatInput = useRef(null);
    const chatid = chatroom.order[props.idx];
    const history = chathistory.find(data => data.chatid === chatid);
    // const lastchat = `#${history?.list.length}`;

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
        // chatInput.current?.reset();
        // setChat("");
        
    }
    const handleInputKeypress = (event:any) => {
        if (event.key === 'Enter'){
            handleSendBtn(event);
        }
    }

    return (
        <div className='h-100' key={`chatroom${props.idx}`}>
            <button className='btn' onClick={()=>handleArrowClick()}><i className='bi bi-arrow-left'></i></button>
            <div className="border h-75 overflow-scroll">
                {history?.list.map((data, idx)=>{
                    if (data.userid === user.id)
                        return <MyChatBox idx={idx} chatid={chatid} content={data.content}></MyChatBox>
                    else
                        return <ChatBox idx={idx} chatid={chatid} userid={data.userid} content={data.content}></ChatBox>
                })}
            </div>
            <div className='d-flex'>
                <input className='col-10' onChange={(e)=>handleInputChange(e)} onKeyPress={handleInputKeypress} ref={chatInput}></input>
                <button className='btn btn-outline-dark col-2 p-1' onClick={handleSendBtn}><i className='bi bi-send'></i></button>
            </div>
        </div>
    );
}