import axios from 'axios';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../../socket/socket';
import { User, Friend } from '../../types/userTypes';
import { RootState } from '../../redux/rootReducer';
import { initialize } from '../../redux/userReducer';
import MatchHistory from '../games/MatchHistory';
import Profile from '../../icons/Profile';
import './profileModal.css';

export default function MyProfileModal() {
	const history = useHistory();
	const dispatch = useDispatch();
	const [num, setNum] = useState<string>('');
	const [qrcode, setQrcode] = useState<string>('');
	const [state, setState] = useState<boolean>(false);
	const user:User = useSelector((state:RootState)=>state.userReducer.user);

	const handleInput = (event:any) => { setNum(event.target.value); }
	const checkToken = ():boolean => {
		if (num.length !== 6){ return false; }
		for (let i = 0; i < num.length; i++){
			if (isNaN(parseInt(num[i]))){ return false; }
		}
		return true;
	}
	const handleSubmit = () => {
		if (!checkToken()){
			alert('다시 시도해주세요.');
			return ;
		}
		// console.log(num);
		if(!user.twofactor){
			axios.post('/2fa/turn-on', {twoFactorAuthenticationCode: num}).then((res:any)=>{
				// console.log(res)
				alert('확인되었습니다.');
				setState(false);
				socket.emit('userInfo');
			}).catch((err:any)=>{
				alert('다시 시도해주세요.');
				console.log(err);
			});
		}else{
			axios.post('/2fa/turn-off', {twoFactorAuthenticationCode: num}).then((res:any)=>{
				// console.log(res);
				alert('확인되었습니다.');
				setState(false);
				socket.emit('userInfo');
			}).catch((err:any)=>{
				alert('다시 시도해주세요.');
				console.log(err);
			});
		}
	}
	const handleQrcode = () => {
		if (!state && !user.twofactor) {
			// console.log('generate: ' + '/2fa/generate');
			axios.post('/2fa/generate').then((res:any)=>{
				// console.log(`qrcode = ` + res.data);
				// console.log(typeof res.data);
				setQrcode(res.data);
			}).catch((err:any)=>{ console.log(err); });
		}
		setState(!state);
	}
	const handleLogout = () => {
		axios.get('/auth/logout').then(res => console.log('Log out! ' + res)).catch(err => {throw new Error(err)});
		dispatch(initialize());
		history.replace('/');
	}
	const handleClick = (userid: string) => { socket.emit('opponentProfile', {userid: userid}); }
	const friendList = () => {
		let list:Array<JSX.Element> = [];

		user.friends?.forEach((friend:Friend)=>{
			list.push(
				<div className='row text-center align-items-center' id='friendContent' key={`friend_${friend.userid}`} data-dismiss='modal' data-toggle='modal' data-target='#profileModal' onClick={()=>handleClick(friend.userid)}>
					<div className='col' key={`friend_${friend.userid}_img`}><img src={Profile(friend.profile)} alt='profile' id='friendProfile'/></div>
					<div className='col' key={`friend_${friend.userid}_nickname`}>{friend.nickname}</div>
					<div className='col' key={`friend_${friend.userid}_onoff`}>{friend.onoff ? <div className='circle bg-danger'/> : <div className='circle bg-light'/>}</div>
				</div>
			);
		});
		return list;
	}
	const blockList = () => {
		let list:Array<JSX.Element> = [];
		user.blacklist?.forEach((friend:Friend)=>{
			list.push(
				<div className='row' id='friendContent' data-dismiss='modal' data-toggle='modal' data-target='#profileModal' onClick={()=>handleClick(friend.userid)}>
					<div className='col-3'><img src={Profile(friend.profile)} alt='profile' id='friendProfile'/></div>
					<div className='col'>{friend.nickname}</div>
				</div>
			)
		});
		return list;
	}

	return (
		<div className='modal fade' id='myProfileModal' role='dialog' tabIndex={-1} aria-labelledby='MyProfileModalLabel' aria-hidden='true'>
			<div className='modal-dialog modal-dialog-centered' role='document'>
				<div className='modal-content'>
					<div className='modal-header'>
						<h5 className='modal-title'>내 프로필</h5>
						<button type='button' className='btn modal-button' data-dismiss='modal' aria-label='Close'>
							<span aria-hidden='true'>&times;</span>
						</button>
					</div>
					<div className='modal-body'>
						<div className='container p-1'>
							<div className='col'>
								<div className='row mb-2'>
									<div className='col m-0 p-0 text-center'>
										<img src={Profile(user ? user.profile : 0)} alt='profile' className='row m-1' id='myProfile'/>
										<button className='row col-11 btn modal-button' data-dismiss='modal' onClick={()=>history.push('/nickandprofile')}>정보 변경</button>
									</div>
									<div className='col p-1 mx-0'>
										<div className='row-4 my-1 p-2 h4' id='profileBorder'>{user.nickname}</div>
										<div className='row-4 my-1 p-2 h4' id='profileBorder'>{user.level}</div>
										<div className='row-4 my-1 p-2 h5' id='profileBorder'>{user.win + user.lose}전 {user.win} 승 {user.lose}패</div>
									</div>
									<div className='col' id='modalTwofactor'>
										<div className='row pt-2' id='modalTwofactorTitle'>
											<div className='col h5 text-center'>2중 인증</div>
											<div className='col-3 form-check form-switch'>
												<input className='form-check-input' type='checkbox' onChange={handleQrcode} checked={user.twofactor}/>
											</div>
										</div>
										{ state && 
											<div className='text-center'>
												<label>Google OTP 인증해주세요.</label>
												{ user && !user.twofactor &&
													<div className='row m-1' id='myProfileQrcode'><img src={qrcode} alt='qrcode'></img></div>
												}
												<div className='row my-1 input-group mx-auto'>
												  <input type='number' className='col form-control' id='modalInput2fa' placeholder='ex)123456' maxLength={6} onChange={handleInput}/>
												  <button className='col btn modal-button px-0' type='button' onClick={handleSubmit}>확인</button>
												</div>
											</div>
										}
									</div>
								</div>
								<div className='row'>
									<div className='col p-1 mx-1' id='myProfileNav'>
										<nav>
											<div className='nav nav-tabs' id='myprofile-nav-tab' role='tablist'>
												<button className='nav-link active' id='nav-friend-tab' data-bs-toggle='tab' data-bs-target='#nav-friend' type='button' role='tab' aria-controls='nav-friend' aria-selected='true'>친구목록</button>
												<button className='nav-link' id='nav-block-tab' data-bs-toggle='tab' data-bs-target='#nav-block' type='button' role='tab' aria-controls='nav-block' aria-selected='false'>차단목록</button>
											</div>
										</nav>
										<div className='tab-content' id='myprofile-nav-tabContent'>
											<div className='tab-pane fade show active' id='nav-friend' role='tabpanel' aria-labelledby='nav-friend-tab'>{friendList()}</div>
											<div className='tab-pane fade' id='nav-block' role='tabpanel' aria-labelledby='nav-block-tab'>{blockList()}</div>
										</div>
									</div>
									<div className='col' id='myMatchHistory'>
										{ user && <MatchHistory userid={user.userid} matchHistory={user.history}/> }
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className='modal-footer'>
						<button type='button' className='btn modal-button' id='logoutBtn' data-dismiss='modal' onClick={handleLogout}>로그아웃</button>
						<button type='button' className='btn modal-button' data-dismiss='modal'>닫기</button>
					</div>
				</div>
			</div>
		</div>
	);
}