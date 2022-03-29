import { useEffect, useState } from "react"
import { socket } from "../../socket/socket";
import AddGameRoomModal from "../../components/modals/AddGameRoomModal";
import GameRoomSlide from "../../components/games/GameRoomSlide";
import LoadingModal from "../../components/modals/LoadingModal";

export default function Lobby(){
	const [search, setSearch] = useState<string>("");
	const [content, setContent] = useState<string>("잠시만 기다려 주세요");

	useEffect(()=>{
		console.log("Lobby!");
		// console.log(socket);
	}, []);

	const handleSearch = (event:any) => { console.log(event.target.value); setSearch(event.target.value); }
	const handleCancelMatching = () => { socket.emit("randomMatchingCancel"); }
	const handleMatching = () => {
		socket.emit("randomMatching", (result: boolean)=>{
			if (!result){ setContent("매칭 가능한 게임 방이 없습니다."); }
		});
	}
	$("#LoadingModal").on("hide.bs.modal", function(e){
		console.log("Loading is over!");
		handleCancelMatching();
		e.stopImmediatePropagation();
	});

	return (
		<div className="container" id="lobbyPad">
			<div className="col" id="lobbyPadRow">
				<div className="row" id="lobbyPadBtn">
					<div id="lobbySearchIcon"><i className="bi bi-search"></i></div>
					<input className="d-none" type="password"></input>
					<input className="col col-sm-5 col-md-5 col-lg-4 col-xl-4" type="text" id="lobbySearch" placeholder="title" onChange={handleSearch}></input>
					<button className="col btn" id="lobbyButton" data-toggle="modal" data-target="#addGameRoomModal"><i className="bi bi-plus-circle"></i> <br/>방 만들기</button>
					<button className="col btn" id="lobbyButton" data-toggle="modal" data-target="#loadingModal" onClick={handleMatching}><i className="bi bi-controller"></i> <br/>랜덤 매칭</button>
				</div>
				<div className="row" id="lobbySlide"><GameRoomSlide search={search}/></div>
			</div>
			<AddGameRoomModal/>
			<LoadingModal content={content}/>
		</div>
	);
}