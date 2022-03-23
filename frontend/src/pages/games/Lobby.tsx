import { useState } from "react"
import { socket } from "../../socket/userSocket";
import AddGameRoomModal from "../../components/modals/AddGameRoomModal";
import GameRoomSlide from "../../components/games/GameRoomSlide";
import LoadingModal from "../../components/modals/LoadingModal";

export default function Lobby(props:any){
	const [search, setSearch] = useState<string>("");
	const [content, setContent] = useState<string>("잠시만 기다려 주세요");

	const handleSearch = (event:any) => {
		setSearch(event.target.value);
	}
	const handleMatching = () => {
		socket.emit("randomMatching", (result: boolean)=>{
			if (!result)
				setContent("매칭 가능한 게임 방이 없습니다.");
		})
	}
	const handleCancelMatching = () => {
		socket.emit("randomMatchingCancel");
	}
	$("#LoadingModal").on("hide.bs.modal", function(e){
		// console.log(e);
		console.log("Loading is over!");
		handleCancelMatching();
		e.stopImmediatePropagation();
	});

	return (
		<div className="container" id="lobbyPad">
			<div className="col" id="lobbyPadRow">
				<div className="row-4 mx-1 my-3 p-2 border">
					<i className="bi bi-search mx-3"></i>
					<input className="col col-sm-5 col-md-5 col-lg-4 col-xl-4" id="lobbySearch" placeholder="title" onChange={handleSearch}></input>
					<button className="col-2 btn" id="lobbyButton" data-toggle="modal" data-target="#addGameRoomModal"><i className="bi bi-plus-circle"></i> 방 만들기</button>
					<button className="col-2 btn" id="lobbyButton" data-toggle="modal" data-target="#loadingModal" onClick={handleMatching}><i className="bi bi-controller"></i> 랜덤 매칭</button>
				</div>
				<div className="row h-100">
					<GameRoomSlide search={search}></GameRoomSlide>
				</div>
			</div>
			<AddGameRoomModal></AddGameRoomModal>
			<LoadingModal content={content}></LoadingModal>
		</div>
	);
}