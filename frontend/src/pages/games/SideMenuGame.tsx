import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { socket } from '../../socket/socket';
import { gameRoomDetail } from '../../types/gameTypes';
import { RootState } from '../../redux/rootReducer';
import MenuGame from '../../components/games/MenuGame';

export default function SideMenuGame(){
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);

	useEffect(()=>{
		console.log('side menu game here!!');
	});

	const handleClick = () => {
		socket.emit('myChatRoom');
	}

	return (
		<div id='gameTab'>
			<div className='row'>
				<div className='col-3 btn' id='tab-game-active'>
					<Link to={`/game${gameroom.roomid !== '' ? `/waiting/${gameroom.roomid}`: ''}`} className='text-decoration-none text-reset'>game</Link>
				</div>
				<div className='col-3 btn' id='tab-chat'>
					<Link to={`/game/chat${gameroom.roomid !== '' ? `/waiting/${gameroom.roomid}`: ''}`} className='text-decoration-none text-reset' onClick={handleClick}>chat</Link>
				</div>
			</div>
			<div className='row' id='nav-game'><MenuGame/></div>
		</div>
	);
}