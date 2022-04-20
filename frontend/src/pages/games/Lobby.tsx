import axios from 'axios';
import { useEffect, useState } from 'react'
import { socket } from '../../socket/socket';
import AddGameRoomModal from '../../components/modals/AddGameRoomModal';
import GameRoomSlide from '../../components/games/GameRoomSlide';
import { useHistory } from 'react-router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { BACK_URL } from '../../types/urlTypes';
import { message } from '../../types/chatTypes';
import { gameRoomDetail, playRoom, playRoomDetail } from '../../types/gameTypes';
import { RootState } from '../../redux/rootReducer';
import { updateGameRoom, updatePlayRoom } from '../../redux/gameReducer';

export default function Lobby({setIsOpen, setLoadingOpen, setMatchingOpen}:{setIsOpen:Function, setLoadingOpen:Function, setMatchingOpen:Function}){
	const [search, setSearch] = useState<string>('');
	const history = useHistory();
	const dispatch = useDispatch();
	const checkUrl:string = BACK_URL + '/user/check';
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);

	useEffect(()=>{
		// console.log('Lobby!');
		axios.get(checkUrl + '?url=lobby').then((res:any) => {
			const path:string = history.location.pathname;
			if (res.data.state) {
				console.log(res.data.state);
				if (res.data.state === 'playing' && path.search('play') === -1 && gameroom.roomid){
					socket.emit('exitGameRoom', { roomid: gameroom.roomid });
				} else if (res.data.state === 'waiting' && path.search('waiting') === -1 && gameroom.roomid){
					socket.emit('exitGameRoom', { roomid: gameroom.roomid });
  		  } else if (res.data.state === 'logout'){
  		    history.replace('/');
  		  }
  		}
		}).catch((err)=>{
			console.log(err);
			history.replace('/');
		});
		socket.on('enterGameRoom', (msg: gameRoomDetail | message) => {
			// console.log('enter game room');
			// console.log(msg);
			setLoadingOpen(false);
			setMatchingOpen(false);
			if ('message' in msg) {
				alert('fail to enter the room!');
				// if (history.location.pathname.search('waiting')){
				// 	history.replace('/game');
				// }
			}else {
				dispatch(updateGameRoom(msg));
				history.push(`${history.location.pathname}/waiting/${msg.roomid}`);
				// if (history.location.pathname.indexOf('waiting') === -1){
				// 	history.push(`${history.location.pathname}/waiting/${msg.roomid}`);
				// }
			}
		});
		socket.on('enterPlayRoom', (msg: playRoomDetail | message) => {
			setLoadingOpen(false);
			setMatchingOpen(false);
			if ('message' in msg) {
				alert('fail to enter the room!');
			} else {
				const game: gameRoomDetail = {
					roomid: msg.roomid,
					manager: msg.manager,
					title: msg.title,
					speed: msg.speed,
					observer: msg.observer,
					type: msg.type,
					players: msg.players,
					isPlayer: msg.isPlayer,
					status: msg.status,
				};
				const play: playRoom = {
					roomid: msg.roomid,
					score: msg.score,
			    left: msg.left,
			    right: msg.right,
				};
				dispatch(updateGameRoom(game));
				dispatch(updatePlayRoom(play));
				history.push(`/game/play/${msg.roomid}`);
			}
		});
		return ()=>{
			socket.off('enterGameRoom');
			socket.off('enterPlayRoom');
		}
	});

	const handleSearch = (event:any) => {
		setSearch(event.target.value);
	}
	const handleMatching = () => {
		socket.emit('randomMatching', (result: boolean)=>{
			if (!result){
				setIsOpen(false);
				alert('매칭 가능한 게임 방이 없습니다.');
			}
		});
		setIsOpen(true);
	}

	return (
		<div className='container' id='lobbyPad'>
			<div className='col' id='lobbyPadRow'>
				<div className='row' id='lobbyPadBtn'>
					<div id='lobbySearchIcon'><i className='bi bi-search'></i></div>
					<input className='d-none' type='password'></input>
					<input className='col col-sm-5 col-md-5 col-lg-4 col-xl-4' type='text' id='lobbySearch' placeholder='title' onChange={handleSearch}></input>
					<button className='col btn' id='lobbyButton' data-toggle='modal' data-target='#addGameRoomModal'><i className='bi bi-plus-circle'></i> <br/>방 만들기</button>
					<button className='col btn' id='lobbyButton' onClick={handleMatching}><i className='bi bi-controller'></i> <br/>랜덤 매칭</button>
				</div>
				<div className='row' id='lobbySlide'><GameRoomSlide search={search}/></div>
			</div>
			<AddGameRoomModal/>
		</div>
	);
}