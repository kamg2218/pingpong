import { useState } from 'react';
import TitleInput from './TitleInput';
import MenuChatDropdown from './MenuChatDropdown';
import { ChatRoom } from '../../socket/chatSocket';

//자료형 수정 필요

type Info = {
    idx: number,
    chatid: string,
    title: string,
    member: Array<string>
}

function memberlist(member: Array<string>) : string {
    let list :string = '';
    console.log(member.length);
    for (let i = 0; i < member.length; i++){
        if (i === 3){
            list += ', ...';
            return list;
        }
        else if (i > 0)
            list += ', ';
        list += member[i];
    }
    return list;
}

export default function Chatroom(props :any){
    const [title, setTitle] = useState(props.info.title);

    const handleTitle = (idx:number, newTitle: string) => {
        setTitle(newTitle);
        props.setTitle(idx, newTitle);
    }
    const handleDoubleClick = (info: Info) => {
        console.log(title);
        props.getIdx(info.idx);
    }

    return(
        <li key={props.info.idx} className='btn btn-light row col-12 m-1' onDoubleClick={() => handleDoubleClick(props.info)}>
            <div className='d-flex' id='box'>
                <div className='text-left font-weight-bold m-2' id='boxTitle'>
                    {props.info.title[0] === '#' ? <TitleInput setTitle={props.setTitle} idx={props.info.idx} title={props.info.title} setState={setTitle}/> : (props.info.title !== '' ? props.info.title : memberlist(props.info.members))}
                </div>
                <div className='m-2 font-weight-light member' id='boxMembers'>{props.info.title[0] === '#' ?? props.info.member.length}</div>
            </div>
            <MenuChatDropdown info={props.info} setTitle={handleTitle} exitChatRoom={props.exitChatRoom}/>
        </li>
    );
}