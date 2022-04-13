import {useState} from "react"
import {socket} from "../../socket/socket"
import InputPwdModal from "../modals/InputPwdModal"
import "../../css/GameBox.css"
import { GameRequest, gameRoom } from "../../types/gameTypes";

export default function GameBox({info}:{info:gameRoom}){
	const [state, setState] = useState<boolean>(false);
	const [pwd, setPwd] = useState<string>("");

	const handleOk = () => {
		handleEnterGameRoom(state);
	}
 	const handleEnterGameRoom = (result: boolean) => {
		let gameInfo:GameRequest = { roomid: info.roomid, isPlayer: result }
		setState(result);
		if (pwd !== ""){ gameInfo.password = pwd; }
		socket.emit("enterGameRoom", gameInfo);
	}
	const handlePwd = (result: boolean) => {
		const content: string = result ? "게임하기" : "관전하기";
		const k: string = result ? `${info.roomid}BoxPlaying` : `${info.roomid}BoxWatching`;

		if ((result && info.player === 2)
			|| (!result && info.observer === info.maxObserver)){
			return <div key={k} className="btn btn-sm disabled" id="gameBoxButton">{content}</div>
		}else if (info.password){
			return <div key={k} className="btn btn-sm" id="gameBoxButton" data-toggle="modal" data-target="#inputPwdModal" onClick={()=>setState(result)}>{content}</div>
		}else{
			return <div key={k} className="btn btn-sm" id="gameBoxButton" onClick={()=>handleEnterGameRoom(result)}>{content}</div>
		}
	}
	const handleLock = () => {
		if (info.password){
			return <i key={`${info.roomid}BoxLock`} className="col bi bi-lock"></i>
		}else{
			return <i key={`${info.roomid}BoxUnlock`} className="col bi bi-unlock"></i>;
		}
	}

	return (
		<div key={`${info.roomid}gamebox`} className="col-6 m-0 p-2">
			<div key={`${info.roomid}gameBoxBorder`} className="p-3" id="gameBox">
				<div key={`${info.roomid}BoxInfo`} className="row align-items-start h3 p-1 px-4">
					{info.title}
					{handleLock()}
				</div>
				<div key={`${info.roomid}BoxButtonRow`} className="d-flex">
					<div key={`${info.roomid}BoxWatchingBlock`} className="col mx-2">
						<div key={`${info.roomid}BoxWatchingPeople`}>{`${info.observer}/${info.maxObserver}`}</div>
						{handlePwd(false)}
					</div>
					<div key={`${info.roomid}BoxPlayingBlock`} className="col mx-2">
						<div key={`${info.roomid}BoxPlayingPeople`}>{`${info.player}/2`}</div>
						{handlePwd(true)}
					</div>
				</div>
			</div>
			<InputPwdModal setPwd={setPwd} handleOk={handleOk}></InputPwdModal>
		</div>
	);
}