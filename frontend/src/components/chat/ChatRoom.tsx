import { useState } from "react";

export default function ChatRoom(props :any){
    const [chat, setChat] = useState('');

    const handleArrowClick = () => {
        props.getIdx(-1);
    }

    const handleInputChange = (e :any) => {
        setChat(e.target.value);
    }

    return (
        <div id={props.idx}>
            <button className='btn m-2' onClick={()=>handleArrowClick()}><i className="bi bi-arrow-left"></i></button>
            <div className='border chatBox'>{chat}</div>
            <input className='input' onChange={(e)=>handleInputChange(e)}></input>
        </div>
    );
}