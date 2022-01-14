import { useContext, useEffect, useState } from 'react'
import {socket} from '../../socket/userSocket'
import {GameContext, gameRoomDetail} from '../../socket/gameSocket'
import MenuPlay from '../../components/games/MenuPlay'

export default function SideMenuPlay(){
	const context = useContext(GameContext);
	const [gameRoom, setRoom] = useState<gameRoomDetail>(context.room[0]);

	useEffect(()=>{
		//조건이 필요한가?
	}, [gameRoom]);
	return (
		<div id='playTab'>
			<div className='row'>
				<div className='col-3 btn border border-bottom-0 rounded-top bg-light' id='tab-play'>
					play
				</div>
			</div>
			<div className='row border-top' id='nav-play'>
				<MenuPlay gameRoom={gameRoom}></MenuPlay>
			</div>
		</div>
	);
}