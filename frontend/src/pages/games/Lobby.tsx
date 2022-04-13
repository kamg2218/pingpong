import { useEffect, useState } from "react"
import { socket } from "../../socket/socket";
import AddGameRoomModal from "../../components/modals/AddGameRoomModal";
import GameRoomSlide from "../../components/games/GameRoomSlide";

export default function Lobby({setContent, setIsOpen}:{setContent:Function, setIsOpen:Function}){
	const [search, setSearch] = useState<string>("");

	useEffect(()=>{
		console.log("Lobby!");
	});

	const handleSearch = (event:any) => {
		// console.log(event.target.value);
		setSearch(event.target.value);
	}
	const handleMatching = () => {
		socket.emit("randomMatching", (result: boolean)=>{
			if (!result){ setContent("매칭 가능한 게임 방이 없습니다."); }
		});
		setIsOpen(true);
	}

	return (
		<div className="container" id="lobbyPad">
			<div className="col" id="lobbyPadRow">
				<div className="row" id="lobbyPadBtn">
					<div id="lobbySearchIcon"><i className="bi bi-search"></i></div>
					<input className="d-none" type="password"></input>
					<input className="col col-sm-5 col-md-5 col-lg-4 col-xl-4" type="text" id="lobbySearch" placeholder="title" onChange={handleSearch}></input>
					<button className="col btn" id="lobbyButton" data-toggle="modal" data-target="#addGameRoomModal"><i className="bi bi-plus-circle"></i> <br/>방 만들기</button>
					<button className="col btn" id="lobbyButton" onClick={handleMatching}><i className="bi bi-controller"></i> <br/>랜덤 매칭</button>
				</div>
				<div className="row" id="lobbySlide"><GameRoomSlide search={search}/></div>
			</div>
			<AddGameRoomModal/>
		</div>
	);
}