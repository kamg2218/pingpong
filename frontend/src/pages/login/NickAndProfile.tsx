import axios from 'axios';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import AlertModal from '../../components/modals/AlertModal';
import ProfileCarousel from '../../components/login/ProfileCarousel';
import { socket } from '../../socket/socket';
import { User } from '../../types/userTypes';
import { BACK_URL } from '../../types/urlTypes';
import { gameRoomDetail } from '../../types/gameTypes';
import { RootState } from '../../redux/rootReducer';
import { updateUser } from '../../redux/userReducer';
import './NickAndProfile.css';

export default function NickAndProfile(){
	const history = useHistory();
	const [profile, setProfile] = useState<number>(0);
	const [nickname, setNickname] = useState<string>('');
	const [checkModalText, setCheckModalText] = useState<string>('ERROR');
	const nicknamePlaceholder:string = '2~12 characters only';
	const btn = document.querySelector('#okBtn');
	const checkUrl:string = BACK_URL + '/user/check';
	const logout:string = BACK_URL + '/auth/logout';

	const dispatch = useDispatch();
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	
	const doubleCheck:string = '중복 확인 해주세요!';
	const possible:string = '사용 가능한 닉네임입니다.';
	const impossible:string = '사용 불가능한 닉네임입니다.';

	useEffect(()=>{
		axios.get(checkUrl + '?url=nickandprofile').then((res:any)=>{
			// console.log('----->', res.data.state);
  		if (res.data.state){
  		  if ((res.data.state === 'playing' || res.data.state === 'waiting') && gameroom.roomid){
  		    socket.emit('exitGameRoom', { roomid: gameroom.roomid });
  		  } else if (res.data.state === 'logout'){
					history.replace('/');
				}
  		}
		}).catch((err)=>{
			console.log(err);
			history.push('/');
		});
		socket.on('requestLogout', () => {
			axios.get(logout)
				.then(res => alert('로그아웃 되었습니다.'))
				.catch(err => {throw new Error(err)});
			history.push('/');
		});
		return () => { socket.off('requestLogout'); }
	}, [checkUrl, dispatch, gameroom.roomid, history]);
	
	const handleInput = (event: any) => {
		setNickname(event.target.value);
		if (btn && !btn.getAttribute('data-toggle')){
			btn.setAttribute('data-toggle', 'modal');
			btn.setAttribute('data-target', '#okModal');
			setCheckModalText(doubleCheck);
		}
	}
	const handleCheck = (event : any) => {
		event.preventDefault();
		if (nickname.length < 2 || nickname.length > 12 || nickname[0] === '#'){
			setCheckModalText(impossible);
			return ;
		}
		axios.get(BACK_URL + `/auth/check?nickname=${nickname}`)
			.then(res=>{
				// console.log(res.data);
				if (res.data.message === false){
					setCheckModalText(possible);
					if (btn){
						btn.removeAttribute('data-toggle');
						btn.removeAttribute('data-target');
					}
				}else{
					setCheckModalText(impossible);
				}
			}).catch(error=>{console.log(error)});
	}
	const handleOK = (event: any) => {
		event.preventDefault();
		if (conditionals() === false){
			setCheckModalText(doubleCheck);
			return ;
		}
		axios.post(BACK_URL + `/auth/signup`, { nickname, profile })
		.then(res=>{
			// console.log(res);
			// console.log(res.data);
			if (res.data){
				let tmp = user;
				tmp.profile = profile;
				tmp.nickname = nickname;
				dispatch(updateUser(tmp));
				history.push('/game');
			}
		}).catch(err=>{ console.error(err); });
	}
	const handleCancel = (event: any) => {
		event.preventDefault();
		history.push('/');
	}
	const conditionals = (): Boolean => {
		if (nickname === '') {
			return false;
		} else if (checkModalText !== possible) {
			return false;
		} else {
			return true;
		}
	}

	return (
		<div id='nickandprofile'>
			<form>
				<ProfileCarousel profile={profile} setProfile={setProfile}></ProfileCarousel>
				<div className='d-flex my-2'>
					<label className='m-2' id='nickLabel'>Nickname</label>
					<input className='m-1' id='nickInput' placeholder={nicknamePlaceholder} onChange={handleInput} minLength={2} maxLength={12} required />
					<button className='btn m-1' id='checkBtn' data-toggle='modal' data-target='#alertModal' onClick={handleCheck}>Check</button>
				</div>
				<div>
					<button className='btn m-1' id='okBtn' type='submit' data-toggle='modal' data-target='#alertModal' onClick={handleOK}>OK</button>
					<button className='btn m-1' id='cancelBtn' type='submit' onClick={handleCancel}>Cancel</button>
				</div>
				<AlertModal content={checkModalText}></AlertModal>
			</form>
		</div>
	);
}