import {user, Friend} from '../../socket/userSocket';

export default function InviteList(props:any){
    let members:Array<string> = [];

    function checkbox(data:Friend){
        const handleClick = async (data:Friend) => {
            if (members.find(idx => idx === data.userid))
                members.filter(idx => idx !== data.userid);
            else
                members.push(data.userid);
            props.setMembers(members);
        }
        return (
            <li className='form-check m-2' key={data.userid}>
                <input className='form-check-input' type='checkbox' value='' onClick={()=>handleClick(data)}></input>
                <label className='form-check-label m-1'>{data.nickname}</label>
            </li>
        );
    }
    
    return (
        <ul key="inviteList">
            {user.friends.map(friend=>checkbox(friend))}
        </ul>
    );
}