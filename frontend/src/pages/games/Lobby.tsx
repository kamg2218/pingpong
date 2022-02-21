import {useState} from "react"
import GameRoomSlide from "../../components/games/GameRoomSlide"
import AddGameRoomModal from "../../components/modals/AddGameRoomModal";
import LoadingModal from "../../components/modals/LoadingModal";
import { socket } from "../../socket/userSocket";

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
		<div className="container mx-1 p-2" id="lobbyPad">
			<div className="row m-0">
				<div className="col-10">
					<div className="row-3 d-flex justify-content-start mx-1 my-2">
						<i className="bi bi-search mx-3"></i>
						<input className="w-50" id="lobbySearch" onChange={handleSearch}></input>
					</div>
					<div className="row h-75">
						<GameRoomSlide search={search}></GameRoomSlide>
					</div>
				</div>
				<div className="col-2 p-0 mx-0 my-5">
				 	<div className="row my-3 mx-1 px-1">
						<button className="btn" id="lobbyButton" data-toggle="modal" data-target="#addGameRoomModal"><i className="bi bi-plus-circle"></i> 방 만들기</button>
					</div>
					<div className="row my-3 mx-1 px-1">
						<button className="btn" id="lobbyButton" data-toggle="modal" data-target="#loadingModal" onClick={handleMatching}><i className="bi bi-controller"></i> 랜덤 매칭</button>
					</div>
				</div>
			</div>
			<AddGameRoomModal></AddGameRoomModal>
			<LoadingModal content={content}></LoadingModal>
		</div>
	);
}