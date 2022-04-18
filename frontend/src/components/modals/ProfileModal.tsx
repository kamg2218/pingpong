import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {useHistory} from 'react-router-dom';
import { socket } from '../../socket/socket';
import { Friend, ProfileUser, User } from '../../types/userTypes';
import { gameRoomDetail } from '../../types/gameTypes';
import { RootState } from '../../redux/rootReducer';
import MatchHistory from '../games/MatchHistory';
import Profile from '../../icons/Profile';
import './profileModal.css';

export default function ProfileModal({gameroom, setIsOpen}:{gameroom:gameRoomDetail, setIsOpen:Function}) {
	const history = useHistory();
	const [profile, setProfile] = useState<ProfileUser>();
	const user:User = useSelector((state:RootState)=>state.userReducer.user);
	const disabled:boolean = profile ? profile.userid === user.userid : false;
	const chatDisabled:boolean = profile ? (user.friends.findIndex((friend:Friend)=>friend.userid === profile.userid) !== -1 ? false : true) : true;
	const button:string = 'row w-75 my-1 btn modal-button';
	let buttonFriend:string = button;
	const myState:boolean = history.location.pathname.search('waiting') !== -1; 
	
	useEffect(() => {
		console.log('ProfileModal');
		socket.on('opponentProfile', (data:ProfileUser) => {
			setProfile(data);
		});
		return ()=>{socket.off('opponentProfile');}
	}, [profile, user]);
	
	const handleChat = () => {
		if (disabled || !profile){ return ; }
		socket.emit('createChatRoom', {
			type: 'private',
			member: [profile?.userid]
		}, (chatid: string)=>{
			console.log(chatid);
			if (chatid !== ''){
				history.push(`/game/chat/${chatid}${gameroom ? `/waiting/${gameroom.roomid}`: ''}`);
			}
		})
	}
	const handleMatch = () => {
		if (disabled || !profile){
			return ;
		} else if (myState) {
			return handleInvite();
		} else {
			socket.emit('matchRequest', { userid: profile?.userid });
			setIsOpen(true);
		}
	}
	const handleInvite = () => {
		socket.emit('inviteGameRoom', {
			userid: profile?.userid,
			roomid: gameroom?.roomid,
		});
	}
	const handleFriend = () => {
		if (disabled || !profile){ return ; }
		if (profile?.friend){
			socket.emit('deleteFriend', { userid: profile?.userid })
			buttonFriend = button;
		}else{
			socket.emit('addFriend', { userid: profile?.userid })
			buttonFriend = button + ' disabled';
		}
	}
	const handleBlock = () => {
		if (disabled || !profile){ return ; }
		if (profile?.block){ socket.emit('unblockFriend', { userid: profile?.userid }) }
		else { socket.emit('blockFriend', { userid: profile?.userid }) }
	}

	return (
		<div className='modal fade' id='profileModal' role='dialog' tabIndex={-1} aria-labelledby='ProfileModalLabel' aria-hidden='true'>
			<div className='modal-dialog modal-dialog-centered' role='document'>
				<div className='modal-content'>
					<div className='modal-header'>
						<h5 id='addGameRoomLabel' className='modal-title'>상대 프로필</h5>
						<button type='button' className='btn modal-button' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>
					</div>
					<div className='modal-body'>
						<div className='container p-1'>
							<div className='row text-center'>
								<div className='col-4'>
									<div className='row mb-2 p-0 justify-content-center'><img src={Profile(profile ? profile.profile : 0)} alt='profile' id='modalProfile'/></div>
									<button className={button} onClick={handleChat} data-dismiss='modal' disabled={disabled || chatDisabled}> 1 : 1 채팅</button>
									<button className={button} onClick={handleMatch} data-dismiss='modal' disabled={disabled}>{myState ? '초대하기' : '대전 신청'}</button>
									<button className={buttonFriend} onClick={handleFriend} data-dismiss='modal' disabled={disabled || profile?.block}>{profile?.friend ? '친구 삭제' : '친구 추가'}</button>
									<button className={button} onClick={handleBlock} data-dismiss='modal' disabled={disabled}>{profile?.block ? '차단 해제' : '차단'}</button>
								</div>
								<div className='col'>
									<div className='row h4'><div className='py-1' id='profileNickname'>{profile ? profile.nickname : 'unknown'}</div></div>
									<div className='row h4 my-2'><div className='py-1' id='profileLevel'>{profile ? profile.level : 'primary'}</div></div>
									<div className='row mt-3 pt-1' id='matchHistory'><MatchHistory userid={profile?.userid} matchHistory={profile?.history}/></div>
								</div>
							</div>
						</div>
					</div>
					<div className='modal-footer'>
						<button type='button' className='btn modal-button' data-dismiss='modal'>닫기</button>
					</div>
				</div>
			</div>
		</div>
	);
}
