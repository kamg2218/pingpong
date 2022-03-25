import { useEffect, useState, useContext} from "react";
import {socket} from "../../context/userContext"
import { gameRoom, GameContext } from "../../context/gameContext"
import GameBox from "./GameBox"
import "./GameRoomSlide.css";

export default function GameRoomSlide(props: any){
	const gameContext = useContext(GameContext);
	const [idx, setIdx] = useState<number>(0);
	const gameRoomList = gameContext.gameroomlist;
	let list: Array<gameRoom> = gameRoomList[0];

	useEffect(()=>{
		if (!gameRoomList[0]){
			console.log("game room list!")
			socket.emit("gameRoomList");
		}
		socket.on("gameRoomList", (msg:gameRoom)=>{
			console.log("socket on! gameRoomList in gmaeRoomSlide!")
			gameRoomList[1](msg);
		});
	}, [idx, gameRoomList, gameContext, list]);

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
		
		if (!list){
			return [];
		}
		for (;i < list.length; i++){
			if (i >= (idx * 6) + 6)
				break ;
			carousel.push(<GameBox key={`${list[i].roomid}box`} info={list[i]} idx={i}></GameBox>);
		}
		return carousel;
	}
	const handleSearchItem = () => {
		let searchRoom = gameRoomList[0];
		if (searchRoom && searchRoom.length > 0){
			searchRoom = gameRoomList[0].filter((room:gameRoom) => room.title.indexOf(props.search) !== -1);
		}
		list = searchRoom;
		return handleCarouselItem();
	}

	return (
		<div className="container h-100">
			<div className="col h-100" id="slideFirstCol">
				<div key="slide1Row" className="row">
					{props.search === "" ? handleCarouselItem() : handleSearchItem()}
				</div>
				<div className="row" id="slide2Row">
					<span id="slidePrev" className="carousel-control-prev-icon mx-5" aria-hidden="true" onClick={()=>handleButton(-1)}></span>
					<span id="slideNext" className="carousel-control-next-icon mx-5" aria-hidden="true" onClick={()=>handleButton(1)}></span>
				</div>
			</div>
		</div>
	);
}