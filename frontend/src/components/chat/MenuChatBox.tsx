import { useState } from 'react';
import TitleInput from './TitleInput';
import MenuChatDropdown from './MenuChatDropdown';
import { chatroom, User } from '../../socket/chatSocket';

// type Info = {
//     idx: number,
//     chatid: string,
//     title: string,
//     member: Array<string>
// }

function memberlist(member: Array<User>) : string {
    let list :string = '';
    console.log(member.length);
    for (let i = 0; i < member.length; i++){
        if (i === 3){
            list += ', ...';
            return list;
        }
        else if (i > 0)
            list += ', ';
        list += member[i].nickname;
    }
    return list;
}

export default function MenuChatBox(props :any){
    const [title, setTitle] = useState(props.info.title);

    const handleTitle = (chatid:string, newTitle: string) => {
        setTitle(newTitle);
        props.setTitle(chatid, newTitle);
    }
    const handleDoubleClick = (chatid: string) => {
        const idx = chatroom.order.indexOf(chatid);
        if (idx !== -1)
            props.getIdx(idx);
    }

    return(
        <li key={props.info.chatid} className='btn btn-light row col-12 m-1' onDoubleClick={() => handleDoubleClick(props.info.chatid)}>
            <div className='d-flex' id='box'>
                <div className='text-left font-weight-bold m-2' id='boxTitle'>
                    {props.info.title[0] === '#' ?
                        <TitleInput setTitle={handleTitle} info={props.info}/>
                            : (props.info.title !== "" ? props.info.title : memberlist(props.info.members))
                    }
                </div>
                <div className='m-2 font-weight-light member' id='boxMembers'>{props.info.title[0] === '#' ?? props.info.member.length}</div>
            </div>
            <MenuChatDropdown info={props.info} setTitle={handleTitle} exitChatRoom={props.exitChatRoom}/>
        </li>
    );
}