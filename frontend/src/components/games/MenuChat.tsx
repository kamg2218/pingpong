import './MenuChat.css';
import MenuChatDropdown from './MenuChatDropdown';

type Info = {
    idx: number,
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

export default function MenuChat(props :any){
    const chatroom: Array<Info> = [{idx:1, title:'', member:['a', 'b']}, {idx:2, title:'topic', member:['ac', 'bc', 'cd', 'ede']}];
    
    const handleDoubleClick = (info: Info) => {
        // console.log(props.idx);
        props.getIdx(info.idx);
    }
    
    const Chatroom = (info: Info) => {
        return(
            <button className='btn btn-light row m-2 col-12' onDoubleClick={() => handleDoubleClick(info)}>
                <div className='d-flex'>
                    <div className='text-left font-weight-bold m-2'>{info.title !== '' ? info.title : memberlist(info.member)}</div>
                    <div className='m-2 font-weight-light member'>{info.member.length}</div>
                </div>
                <MenuChatDropdown/>
            </button>
        );
    }
    
    const handleAddChat = () => {

    }

    return (
        <div className='container' id='chatlist'>
            <div className='d-flex justify-content-end'>
                <button className='btn addChat' onClick={()=>{handleAddChat()}}><i className="bi bi-chat"></i></button>
            </div>
            <div className='col'>{chatroom.map(info => (Chatroom(info)))}</div>
        </div>
    );
}