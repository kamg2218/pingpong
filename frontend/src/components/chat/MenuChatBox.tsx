import { useState } from 'react';
import TitleInput from '../games/TitleInput';
import MenuChatDropdown from './MenuChatDropdown';

type Info = {
    idx: number,
    chatid: string,
    title: string,
    member: Array<string>
}

function memberlist(member: Array<string>) : string {
    let list :string = '';
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

    const handleDoubleClick = (info: Info) => {
        // console.log(props.idx);
        props.getIdx(info.idx);
    }

    return(
        <li key={props.info.idx} className='btn btn-light row col-12 m-1' onDoubleClick={() => handleDoubleClick(props.info)}>
            <div className='d-flex' id='box'>
                <div className='text-left font-weight-bold m-2' id='boxTitle'>
                    {props.info.title[0] === '#' ? <TitleInput setTitle={props.setTitle} idx={props.info.idx} title={props.info.title} setState={setTitle}/> : (props.info.title !== '' ? props.info.title : memberlist(props.info.member))}
                </div>
                <div className='m-2 font-weight-light member' id='boxMembers'>{props.info.title[0] === '#' ?? props.info.member.length}</div>
            </div>
            <MenuChatDropdown info={props.info} setTitle={props.setTitle} setState={setTitle}/>
        </li>
    );
}