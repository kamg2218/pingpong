import { useContext, useEffect, useState } from "react"
import {GameContext, gameRoomDetail} from "../../context/gameContext"
import MenuPlay from "../../components/play/MenuPlay"

export default function SideMenuPlay(){
	const gameContext = useContext(GameContext);
	const gameRoom = useState<gameRoomDetail>(gameContext.gameroom[0]);

	useEffect(()=>{
		//조건이 필요한가?
	}, [gameRoom]);
	return (
		<div id="playTab">
			<div className="row">
				<div className="col-3 btn" id="tab-play">play</div>
			</div>
			<div className="row border" id="nav-play">
				<MenuPlay gameRoom={gameRoom}></MenuPlay>
			</div>
		</div>
	);
}