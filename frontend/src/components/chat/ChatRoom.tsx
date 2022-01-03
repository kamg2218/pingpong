import { useState, useRef, useEffect } from "react";
import { Link } from 'react-router-dom'
import {socket, user} from '../../socket/userSocket';
import { chatroom, chathistory } from '../../socket/chatSocket';
import ChatBox from "./ChatBox";
import MyChatBox from "./MyChatBox";
import '../../css/ChatRoom.css'

//채팅방 입장 시, 히스토리 업데이트 필요함!
//chatMessage 업데이트 확인 필요!
//chat 길이 확인!

export default function ChatRoom(props :any){
    const [chat, setChat] = useState("");
    const chatInput = useRef<any>(null);
    const chatid = chatroom?.order[props.idx];
    const history = chathistory?.find(data => data.chatid === chatid);
    // const lastchat = `#${history?.list.length}`;

    useEffect(()=>{
        socket.emit("myChatRoom");
    }, [chat]);
    // console.log(props.idx);
    const handleInputChange = (e :any) => {
        setChat(e.target.value);
    }
    const handleSendBtn = (event:any) => {
        // console.log(props.idx);
        const idx = props.idx;
        socket.emit("chatMessage", {
            chatid: chatroom.chatroom[idx].chatid,
            content: chat,
        }, (result:boolean)=>{
            if (result === false)
                alert('mute!!!');
        });
        // console.log(chatInput.current);
        chatInput.current?.reset();        
    }
    const handleInputKeypress = (event:any) => {
        if (event.key === 'Enter'){
            handleSendBtn(event);
        }
    }

    return (
        <div className='container-fluid p-2' key={`chatroom${props.idx}`}>
            <div className='col'>
                <Link to='/game/chat' className='row text-decoration-none text-reset m-1'><i className='bi bi-arrow-left'></i></Link>
                <div className="row mx-1 border overflow-scroll" id="chatlist">
                    {history?.list.map((data, idx)=>{
                        if (data.userid === user.id)
                            return <MyChatBox idx={idx} chatid={chatid} content={data.content}></MyChatBox>
                        else
                            return <ChatBox idx={idx} chatid={chatid} userid={data.userid} content={data.content}></ChatBox>
                    })}
                </div>
                <form className='d-flex m-0 p-0 border' ref={chatInput}>
                    <input className='col' onChange={(e)=>handleInputChange(e)} onKeyPress={handleInputKeypress}></input>
                    <button className='btn btn-outline-dark col-2' onClick={handleSendBtn}><i className='bi bi-send'></i></button>
                </form>
            </div>
        </div>
    );
}