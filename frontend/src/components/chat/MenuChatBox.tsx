import TitleInput from '../games/TitleInput';
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

export default function Chatroom(props :any){
    const handleDoubleClick = (info: Info) => {
        // console.log(props.idx);
        props.getIdx(info.idx);
    }

    return(
        <button className='btn btn-light row m-2 col-12' onDoubleClick={() => handleDoubleClick(props.info)}>
            <div className='d-flex'>
                <div className='text-left font-weight-bold m-2'>
                    {props.info.title[0] === '#' ? <TitleInput getTitle={props.getTitle} idx={props.info.idx} title={props.info.title} /> : (props.info.title !== '' ? props.info.title : memberlist(props.info.member))}
                </div>
                <div className='m-2 font-weight-light member'>{props.info.title[0] === '#' ?? props.info.member.length}</div>
            </div>
            <MenuChatDropdown info={props.info} getTitle={props.getTitle}/>
        </button>
    );
}