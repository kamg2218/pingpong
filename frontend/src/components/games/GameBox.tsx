import {useState} from "react"
import InputPwdModal from "../modals/InputPwdModal"
import {socket} from "../../socket/userSocket"
import "../../css/GameBox.css"

type info = {
	roomid: string,
	isPlayer: boolean,
	password?: string
}

export default function GameBox(props:any){
	const [state, setState] = useState<boolean>(false);
	const [pwd, setPwd] = useState<string>("");

	const handleEnterGameRoom = (result: boolean) => {
		let info:info = {
			roomid: props.info.roomid,
			isPlayer: result,
		}
		setState(result);
		if (pwd !== "")
			info.password = pwd;
		socket.emit("enterGameRoom", info);
	}
	const handlePwd = (result: boolean) => {
		const k: string = result ? `${props.info.roomid}BoxPlaying` : `${props.info.roomid}BoxWatching`;
		const content: string = result ? "게임하기" : "관전하기";

		if ((result && props.info.player === 2)
			|| (!result && props.info.observer === props.info.maxObserver)){
			return <div key={k} className="btn btn-sm disabled" id="gameBoxButton">{content}</div>
		}
		else if (props.info.password){
			return <div key={k} className="btn btn-sm" id="gameBoxButton" data-toggle="modal" data-target="#inputPwdModal" onClick={()=>setState(result)}>{content}</div>
		}else{
			return <div key={k} className="btn btn-sm" id="gameBoxButton" onClick={()=>handleEnterGameRoom(result)}>{content}</div>
		}
	}
	const handleLock = () => {
		if (props.info.password){
			return <i key={`${props.info.roomid}BoxLock`} className="col-2 bi bi-lock"></i>
		}else{
			return <i key={`${props.info.roomid}BoxUnlock`} className="col-2 bi bi-unlock"></i>;
		}
	}

	return (
		<div key={`${props.info.roomid}gamebox`} className="col-6 m-0 p-2">
			<div key={`${props.info.roomid}gameBoxBorder`} className="p-3" id="gameBox">
				<div key={`${props.info.roomid}gameBoxFirstRow`} className="row p-1">
					<div key={`${props.info.roomid}BoxInfo`} className="col align-items-start h3">{props.info.title}</div>
					{handleLock()}
				</div>
				<div key={`${props.info.roomid}BoxButtonRow`} className="d-flex">
					<div key={`${props.info.roomid}BoxWatchingBlock`} className="col mx-2">
						<div key={`${props.info.roomid}BoxWatchingPeople`}>{`${props.info.observer}/${props.info.maxObserver}`}</div>
						{handlePwd(false)}
					</div>
					<div key={`${props.info.roomid}BoxPlayingBlock`} className="col mx-2">
						<div key={`${props.info.roomid}BoxPlayingPeople`}>{`${props.info.player}/2`}</div>
						{handlePwd(true)}
					</div>
				</div>
			</div>
			<InputPwdModal key={props.info.roomid} state={state} setPwd={setPwd} handleSubmit={handleEnterGameRoom}></InputPwdModal>
		</div>
	);
}