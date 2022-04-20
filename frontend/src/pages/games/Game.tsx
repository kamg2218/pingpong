import { socket } from '../../socket/socket';
import Modal from 'react-modal';
import { useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Friend, User } from '../../types/userTypes';
import { gameRoomDetail, match, result } from '../../types/gameTypes';
import {updateUser, userInitial} from '../../redux/userReducer';
import {RootState} from '../../redux/rootReducer';
import { gameRoomInitialState, initializeGame } from '../../redux/gameReducer';
import Lobby from './Lobby';
import WaitingRoom from './WaitingRoom';
import SideMenuGame from './SideMenuGame';
import SideMenuChat from '../../components/chat/SideMenuChat';
import MatchRequestModal from '../../components/modals/MatchRequestModal';
import MyProfileModal from '../../components/modals/MyProfileModal';
import ProfileModal from '../../components/modals/ProfileModal';
import LoadingModal from '../../components/modals/LoadingModal';
import logo from '../../icons/logo_brown_profile.png';
import './Game.css';
import { BACK_URL } from '../../types/urlTypes';
import axios from 'axios';

Modal.setAppElement('#root');
export default function Game() {
	const history = useHistory();
	const [matchData, setMatch] = useState<match>();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [loadingOpen, setLoadingOpen] = useState<boolean>(false);
	const [matchingOpen, setMatchingOpen] = useState<boolean>(false);
	const [namespace, setNamespace] = useState<string>('matchResponse');
	const content:string = '잠시만 기다려 주세요';
	
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const dispatch = useDispatch();
	const [room, setRoom] = useState<gameRoomDetail>(gameroom);
	const [userState, setUser] = useState<User>(user);
	const logout:string = BACK_URL + '/auth/logout';

	useEffect(() => {
		if (!user || user.userid === '') {
			// console.log('user Info emit!')
			dispatch(updateUser(userInitial));
			socket.emit('userInfo');
		}
		socket.on('requestLogout', () => {
			console.log(gameroom.roomid);
			if (gameroom.roomid){
				socket.emit('exitGameRoom', {roomid: gameroom.roomid});
			}
			axios.get(logout)
				.then(res => alert('로그아웃 되었습니다.'))
				.catch(err => {throw new Error(err)});
			history.push('/');
		});
		socket.on('userInfo', (data:User) => {
			// console.log('user Info is changed!');
			dispatch(updateUser(data));
			setUser(data);
		});
		socket.on('exitGameRoom', () => {
			// console.log('exitGameRoom');
			dispatch(initializeGame());
			setRoom(gameRoomInitialState);
			history.push('/game');
		});
		socket.on('matchResponse', (data:match) => {
			// console.log('matchResponse', data);
			setIsOpen(true);
			setNamespace('matchResponse');
			setMatch(data);
		});
		socket.on('inviteGameRoomResponse', (data:match) => {
			// console.log('inviteGameRoomResponse', data);
			setIsOpen(true);
			setNamespace('inviteGameRoomResponse');
			setMatch(data);
		});
		socket.on('matchRequest', (data:result)=>{
			// console.log('matchRequest', data);
			setMatchingOpen(false);
		})
		socket.on('updateProfile', (data:any)=>{
			const tmp:User = user;
			if (data.nickname){ tmp.nickname = data.nickname; }
			if (data.profile){ tmp.profile = data.profile; }
			setUser({...tmp});
			dispatch(updateUser(tmp));
		});
		socket.on('newFriend', (data:Friend)=>{
			// console.log('newFriend', data);
			const tmp:User = user;
			const idx:number = tmp.newfriends.findIndex((friend:Friend)=>friend.userid === data.userid);
			if (idx === -1){
				tmp.newfriends.push(data);
				dispatch(updateUser(tmp));
				setUser({...tmp});
			}
		});
		socket.on('addFriend', (data:Friend)=>{
			const tmp:User = user;
			const idx:number = tmp.friends.findIndex((friend:Friend)=>friend.userid === data.userid);
			if (idx === -1){
				// console.log('addFriend', data);
				tmp.friends.push(data);
				dispatch(updateUser(tmp));
				setUser({...tmp});
			}
		});
		socket.on('deleteFriend', (data:Friend)=>{
			// console.log('deleteFriend', data);
			const tmp:User = user;
			tmp.friends = tmp.friends.filter((friend:Friend)=>friend.userid !== data.userid);
			dispatch(updateUser(tmp));
			setUser({...tmp});
		});
		socket.on('blockFriend', (data:Friend)=>{
			const tmp:User = user;
			const idx:number = tmp.blacklist.findIndex((friend:Friend)=>friend.userid === data.userid);
			if (idx === -1){
				// console.log('blockFriend', data);
				tmp.blacklist.push(data);
				tmp.friends = tmp.friends.filter((friend:Friend)=>friend.userid !== data.userid);
				dispatch(updateUser(tmp));
				setUser({...tmp});				
			}
		});
		socket.on('updateProfile', (data:any)=>{
			const tmp:User = user;
			if (data.nickname){ tmp.nickname = data.nickname; }
			if (data.profile){ tmp.profile = data.profile; }
			dispatch(updateUser(tmp));
			setUser({...tmp});
		});

		return ()=>{
			socket.off('userInfo');
			socket.off('requestLogout');
			socket.off('exitGameRoom');
			socket.off('matchResponse');
			socket.off('inviteGameRoomResponse');
			socket.off('updateProfile');
			socket.off('matchRequest');
			socket.off('newFriend');
			socket.off('addFriend');
			socket.off('deleteFriend');
			socket.off('blockFriend');
			socket.off('updateProfile');
		}
	}, [dispatch, history, room, user, userState]);
	
	const handleCancelMatching = () => {
		if (loadingOpen){
			setLoadingOpen(false);
			socket.emit('randomMatchingCancel');
		}
	}

	return (
		<div className='container-fluid' id='gamelobby'>
			<div className='col' id='gamelobbyCol'>
				<img className='row' id='gameLogo' src={logo} alt='header'/>
				<div className='row' id='gamePad'>
					<div className='col-xs-12 col-md-4 col-lg-3 d-sm-none d-md-block' id='gamelobbySide'>
						<Switch>
							<Route path='/game/chat' component={SideMenuChat}></Route>
							<Route path='/game' component={SideMenuGame}></Route>
						</Switch>
					</div>
					<div className='col d-none d-sm-block' id='gamelobbyPad'>
						<Switch>
							<Route path='/game/waiting/:id' component={WaitingRoom}></Route>
							<Route path='/game/chat/:idx/waiting/:id' component={WaitingRoom}></Route>
							<Route path='/game/chat/waiting/:id' component={WaitingRoom}></Route>
							<Route path='/game' render={()=><Lobby setIsOpen={setLoadingOpen} setLoadingOpen={setLoadingOpen} setMatchingOpen={setMatchingOpen}/>}></Route>
						</Switch>
					</div>
				</div>
			</div>
			<ProfileModal gameroom={gameroom} setIsOpen={setMatchingOpen}></ProfileModal>
			<MyProfileModal></MyProfileModal>
			<Modal isOpen={matchingOpen} style={customStyles}><LoadingModal content={content}/></Modal>
			<Modal isOpen={loadingOpen} style={customStyles}><LoadingModal content={content} handleCancelMatching={handleCancelMatching}/></Modal>
			<Modal isOpen={isOpen} style={customStyles}><MatchRequestModal setIsOpen={setIsOpen} matchData={matchData} namespace={namespace}/></Modal>
		</div>
	);
}

const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		padding: '0',
		transform: 'translate(-50%, -50%)',
		border: '1px solid #C9A641',
		borderRadius: '25px',
	},
};