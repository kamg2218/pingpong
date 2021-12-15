import { useState } from "react";

//채팅방 입장 시, 히스토리 업데이트 필요함!

export default function ChatRoom(props :any){
    const [chat, setChat] = useState('hello');

    const handleArrowClick = () => {
        props.getIdx(-1);
    }
    const handleInputChange = (e :any) => {
        setChat(e.target.value);
    }

    return (
        <div className='border' id={props.idx}>
            <button className='btn m-2' onClick={()=>handleArrowClick()}><i className="bi bi-arrow-left"></i></button>
            <div className='border chatBox'>{chat}</div>
            <input className='input' onChange={(e)=>handleInputChange(e)}></input>
        </div>
    );
}