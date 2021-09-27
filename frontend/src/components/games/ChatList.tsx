import './ChatList.css';
import ChatroomDropdown from './ChatroomDropdown';

type Info = {
    title?: string,
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

function handleDoubleClick(info: Info){
    return (
        <div>
            Hi!
        </div>
    );
}

function Chatroom(info: Info){
    return(
        <button className='btn btn-light row m-2 col-12' onDoubleClick={() => handleDoubleClick(info)}>
            <div className='d-flex'>
                <div className='text-left font-weight-bold m-2'>{info.title ?? memberlist(info.member)}</div>
                <div className='m-2 font-weight-light member'>{info.member.length}</div>
            </div>
            <ChatroomDropdown/>
        </button>
    );
}

export default function ChatList(){
    const chatroom: Array<Info> = [{member:['a', 'b']}, {title:'topic', member:['ac', 'bc']}];
    return (
        <div className='container' id='chatlist'>
            <div className='d-flex justify-content-end'>
                <button className='btn'><i className="bi bi-chat"></i></button>
            </div>
            <div className='col'>{chatroom.map(info => (Chatroom(info)))}</div>
        </div>
    );
}