import axios from 'axios';
import { socket } from '../socket/socket';
import { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { BACK_URL } from '../types/urlTypes';
import { gameRoomDetail } from '../types/gameTypes';
import { RootState } from '../redux/rootReducer';
import { initialize } from '../redux/userReducer';
import logo_brown from '../icons/logo_brown.png';
import './Main.css';

export default function Main(){
	const login:string = BACK_URL + '/auth/login';
	const logout:string = BACK_URL + '/auth/logout';
	const check:string = BACK_URL + '/user/check';

	const dispatch = useDispatch();
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);

	useEffect(()=>{
		axios.get(check + '?url=main').then((res:any)=>{
			// console.log(res);
  		if (res.data.state){
  		  if ((res.data.state === 'playing' || res.data.state === 'waiting') && gameroom.roomid){
  		    socket.emit('exitGameRoom', { roomid: gameroom.roomid });
  		  } else if ( res.data.state === 'login'){
					axios.get(logout).then(res => console.log('Log out! ' + res)).catch(err => {throw new Error(err)});
				} else {
					dispatch(initialize());
				}
  		}
		}).catch((err)=>{
			console.log(err);
			dispatch(initialize());
		});
	}, [check, dispatch, gameroom, logout]);

	return (
		<div className='container text-center' id='main'>
			<div className='col w-100'>
				<img className='row mt-4' id='logo' src={logo_brown} alt='logo'/>
				<a className='row btn' id='loginButton' href={login} role='button'>LOG IN</a>
			</div>
		</div>
	);
}