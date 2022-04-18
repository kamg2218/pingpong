import { shallowEqual, useSelector } from 'react-redux';
import { User } from '../../types/userTypes';
import { ChatBlock } from '../../types/chatTypes';
import { RootState } from '../../redux/rootReducer';
import Profile from '../../icons/Profile';
import './chat.css';

export default function MyChatBox({idx, chatid, data}:{idx:number, chatid:string, data:ChatBlock}){
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);
	
	const makeTime = () => {
		if (!data || !data.createDate){ return '00:00'; }
		let date:Date = new Date(data.createDate);
		// console.log(`time = ${date}, ${typeof date}`);
		const hour = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return (`${hour}:${minutes}`);
	}

	return (
		<div className='container m-0 p-0' key={`${chatid}mychatbox${idx}`} id={idx.toString()}>
			<div className='row align-items-start justify-content-end'>
				<div className='col-9'>
					<div className='row col-12 justify-content-end' id='mychatboxnickname'>{user.nickname}</div>
					<div className='row col-12' id='mychatboxcontent'>{data.contents}</div>
					<div className='row col-12 small text-muted'>{makeTime()}</div>
				</div>
				<img src={Profile(user.profile)} className='col-2 rounded-circle m-1 mx-0' alt='...'/>
			</div>
		</div>
	);
}