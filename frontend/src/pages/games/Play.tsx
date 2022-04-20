import axios from 'axios';
import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { socket } from '../../socket/socket';
import SideMenuPlay from './SideMenuPlay';
import PlayRoom from '../../components/play/PlayRoom';
import { useDispatch, useSelector } from 'react-redux';
import { BACK_URL } from '../../types/urlTypes';
import { gameRoomDetail } from '../../types/gameTypes';
import { RootState } from '../../redux/rootReducer';
import { initialize } from '../../redux/userReducer';
import { initializeGame } from '../../redux/gameReducer';
import './Play.css';
import logo from '../../icons/logo_brown_profile.png';

export default function Play(){
	const logout:string = BACK_URL + '/auth/logout';
	const checkUrl:string = BACK_URL + '/user/check';
	const history = useHistory();
	const param:any = useParams();
	const dispatch = useDispatch();
	const gameroom:gameRoomDetail = useSelector((state:RootState)=>state.gameReducer.gameroom);

	useEffect(()=>{
		const path: string = history.location.pathname;
		axios.get(checkUrl + '?url=play').then((res:any)=>{
  		if (res.data.state && path.search('play') !== -1){
				console.log('userCheck', res.data.state);
				if (res.data.state === 'playing' && gameroom.roomid !== param.id){
					console.log('playing -  but roomid is different.');
					socket.emit('exitGameRoom', {roomid: gameroom.roomid});
				}else if (res.data.state === 'waiting' && gameroom.roomid){
					console.log('waiting...');
					socket.emit('exitGameRoom', {roomid: gameroom.roomid});
				}else if (res.data.state === 'login'){
					dispatch(initialize());
					history.replace('/game');
				}else if (res.data.state === 'logout'){
					dispatch(initialize());
					history.replace('/');
				}
  		}
		}).catch((err)=>{
			console.log(err);
			history.replace('/');
		});
		socket.on('requestLogout', () => {
			if (gameroom.roomid){
				console.log(gameroom.roomid);
				console.log(param.id);
				socket.emit('exitGameRoom', {roomid: gameroom.roomid});
			}
			axios.get(logout)
				.then(res => alert('로그아웃 되었습니다.'))
				.catch(err => {throw new Error(err)});
			history.push('/');
		});
		socket.on('exitGameRoom', () => {
			// console.log('exitGameRoom');
			dispatch(initializeGame());
			history.push('/game');
		});
		return () => { socket.off('exitGameRoom'); }
	}, [checkUrl, dispatch, gameroom.roomid, history, param.id]);

	return (
		<div className='container-fluid' id='playroom'>
			<div className='col h-100'>
				<img className='row' id='gameLogo' src={logo} alt='header'/>
				<div className='row' id='gameScreen'>
					<div className='col-md-4 col-lg-3 d-none d-sm-none d-md-block' id='sideMenuPlay'><SideMenuPlay/></div>
					<div className='col' id='playRoom'><PlayRoom/></div>
				</div>
			</div>
		</div>
	);
}