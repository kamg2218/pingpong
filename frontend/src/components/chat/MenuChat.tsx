import { useState } from 'react';
import '../../css/MenuChat.css';
import MenuChatBox from './MenuChatBox';

export default function MenuChat(props :any){
    const [index, setIndex] = useState(3);
    const [chatroom, setChatroom] = useState([{idx:1, title:'', member:['a', 'b'], owner:'hello', lock: true}, {idx:2, title:'topic', member:['ac', 'bc', 'cd', 'ede'], owner:'u', lock:false}]);
   
    const handleAddChat = () => {
        setChatroom(chatroom => [...chatroom, {idx:index, title:'#', member:[props.nick], owner:'hhh', lock: false}]);
        setIndex(index + 1);
        //console.log(chatroom);
    }
    const handleTitleChange = (idx :number, title :string) => {
        //console.log(idx, title);
        chatroom[idx - 1].title = title;
        console.log(chatroom);
    }

    return (
        <div className='container' id='chatlist'>
            <div className='d-flex justify-content-end'>
                <button className='btn addChat' onClick={()=>{handleAddChat()}}><i className="bi bi-chat"/></button>
            </div>
            <ul key='chatBoxList' className='col'>
                {chatroom.map(info => <MenuChatBox info={info} getIdx={props.getIdx} setTitle={handleTitleChange}/>)}
            </ul>
        </div>
    );
}