import { useEffect, useState } from 'react';
import {socket} from '../../socket/socket';
import { gameRoom } from '../../types/gameTypes';
import GameBox from './GameBox';
import './GameRoomSlide.css';

export default function GameRoomSlide({search}:{search:string}){
	const [idx, setIdx] = useState<number>(0);
	const [roomlist, setRoomList] = useState<Array<gameRoom>>();

	useEffect(()=>{
		if (!roomlist){
			socket.emit('gameRoomList');
		}
		socket.on('gameRoomList', (msg:Array<gameRoom>)=>{
			// console.log('socket on! gameRoomList in gmaeRoomSlide!');
			setRoomList(msg);
		});
		return ()=>{socket.off('gameRoomList');}
	}, [idx, roomlist]);

	const handleButton = (num: number) => {
		if (!roomlist){
			return ;
		}
		if (num === 1 && (idx + 1) * 6 < roomlist.length){
			setIdx(idx + 1);
		}else if (num === -1 && idx > 0){
			setIdx(idx - 1);
		}
	}
	const handleCarouselItem = (list:Array<gameRoom>) => {
		let i:number = idx * 6;
		let carousel:Array<JSX.Element> = [];
		
		if (!list || !list.length){ return []; }
		for (;i < list.length; i++){
			if (i >= (idx * 6) + 6)
				break ;
			carousel.push(<GameBox key={`GameBox_${list[i].roomid}`} info={list[i]}></GameBox>);
		}
		return carousel;
	}
	const handleSearchItem = () => {
		let searchRoom:Array<gameRoom> | undefined = roomlist;
		if (searchRoom && searchRoom.length > 0){
			searchRoom = searchRoom.filter((room:gameRoom) => room.title.indexOf(search) !== -1);
			return handleCarouselItem(searchRoom);
		}
		return [];
	}

	return (
		<div className='container h-100 p-0'>
			<div className='col h-100' id='slideFirstCol'>
				<div className='row p-0 m-0' id='slide1Row'>
					{handleSearchItem()}
				</div>
				<div className='row-1' id='slide2Row'>
					<span id='slidePrev' className='carousel-control-prev-icon mx-5' aria-hidden='true' onClick={()=>handleButton(-1)}></span>
					<span id='slideNext' className='carousel-control-next-icon mx-5' aria-hidden='true' onClick={()=>handleButton(1)}></span>
				</div>
			</div>
		</div>
	);
}