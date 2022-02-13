import { useEffect, useState, useContext} from 'react';
import {socket} from '../../socket/userSocket'
import { gameRoom, GameContext } from '../../socket/gameSocket'
import GameBox from './GameBox'

export default function GameRoomSlide(props: any){
	const gameContext = useContext(GameContext);
	const [idx, setIdx] = useState<number>(0);
	const [gameRoomList, setList] = useState<Array<gameRoom>>(gameContext.gameroomlist[0] || []);
	let list: Array<gameRoom> = gameRoomList;

	useEffect(()=>{
		//조건이 필요한가?
		console.log(gameContext.gameroomlist[0])
		if (!gameContext.gameroomlist[0]){
			console.log('game room list!')
			socket.emit("gameRoomList");
		}
	}, [idx, gameRoomList, gameContext]);
	socket.on("gameRoomList", (msg)=>{
		console.log('socket on! gameRoomList in gmaeRoomSlide!')
		gameContext.gameroomlist[1](msg);
		setList(msg);
	});
	const handleButton = (num: number) => {
		if (num === 1 && (idx + 1) * 6 < list.length){
			setIdx(idx + 1);
		}else if (num === -1 && idx > 0){
			setIdx(idx - 1);
		}
	}
	const handleCarouselItem = () => {
		let i:number = idx * 6;
		let carousel = [];
		
		for (;i < list.length; i++){
			if (i >= (idx * 6) + 6)
				break ;
			carousel.push(<GameBox key={`${list[i].roomid}box`} info={list[i]} idx={i}></GameBox>);
		}
		return carousel;
	}
	const handleSearchItem = () => {
		const searchRoom = gameRoomList.filter(room => room.title.indexOf(props.search) !== -1);
		list = searchRoom;
		return handleCarouselItem();
	}

	return (
		<div key="gameRoomSlide" className="container m-0 p-0">
			<div key="slideFirstCol" className="col">
				<div key="slide1Row" className="row mx-1 my-0">
					{props.search === "" ? handleCarouselItem() : handleSearchItem()}
				</div>
				<div key="slide2Row" className="row d-flex justify-content-center m-0">
					<span key="slidePrev" className="carousel-control-prev-icon shadow mx-5" aria-hidden="true" onClick={()=>handleButton(-1)}></span>
					<span key="slideNext" className="carousel-control-next-icon shadow mx-5" aria-hidden="true" onClick={()=>handleButton(1)}></span>
				</div>
			</div>
		</div>
	);
}