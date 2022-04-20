import { shallowEqual, useSelector } from 'react-redux';
import { Friend, User } from '../../types/userTypes';
import { RootState } from '../../redux/rootReducer';
import { chatRoom, ChatUser } from '../../types/chatTypes';
import Profile from '../../icons/Profile';

export default function InviteList({setMembers, info}:{setMembers:Function, info?:chatRoom}){
	let members:Array<string> = [];
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);

	const checkbox = (data:Friend) => {
		if (info && info.members.findIndex((member:ChatUser)=>member.userid === data.userid) !== -1){
			return ;
		}
		const handleClick = (data:Friend) => {
			if (members.find(idx => idx === data.userid)) {
				members.filter(idx => idx !== data.userid);
			}else {
				members.push(data.userid);
			}
			setMembers(members);
		}

		return (
			<li className='form-check m-2' key={data.userid}>
				<input className='form-check-input' type='checkbox' value='' onClick={()=>handleClick(data)} autoComplete="off"></input>
				<img src={Profile(data.profile)} className='col-1 mx-1 rounded-circle' alt='...'/>
				<label className='form-check-label mx-1'>{data.nickname}</label>
			</li>
		);
	}
	
	return (
		<ul key='inviteList'>
			{user && user.friends?.map((friend:Friend)=>checkbox(friend))}
		</ul>
	);
}