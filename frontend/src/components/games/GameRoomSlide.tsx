import { useEffect, useState } from "react";
import {socket} from "../../socket/socket"
import { gameRoom } from "../../types/gameTypes"
import GameBox from "./GameBox"
import "./GameRoomSlide.css";

export default function GameRoomSlide(props: any){
	const [idx, setIdx] = useState<number>(0);
	const [roomlist, setRoomList] = useState<Array<gameRoom>>();

	useEffect(()=>{
		if (!roomlist){
			socket.emit("gameRoomList");
		}
		socket.on("gameRoomList", (msg:Array<gameRoom>)=>{
			console.log("socket on! gameRoomList in gmaeRoomSlide!");
			// console.log(msg);
			setRoomList(msg);
			socket.off("gameRoomList");
		});
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
	const handleCarouselItem = () => {
		let i:number = idx * 6;
		let carousel = [];
		
		if (!roomlist || !roomlist.length){ return []; }
		for (;i < roomlist.length; i++){
			if (i >= (idx * 6) + 6)
				break ;
			carousel.push(<GameBox key={`${roomlist[i].roomid}box`} info={roomlist[i]} idx={i}></GameBox>);
		}
		return carousel;
	}
	const handleSearchItem = () => {
		let searchRoom = roomlist;
		if (searchRoom){
			if (searchRoom.length > 0){
			searchRoom = roomlist?.filter((room:gameRoom) => room.title.indexOf(props.search) !== -1);
			}
			setRoomList(searchRoom);
		}
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