import SideMenuPlay from "./SideMenuPlay"
import PlayRoom from "../../components/play/PlayRoom"
import logo from '../../icons/logo_brown_profile.png'
import axios from "axios";
import { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { socket } from "../../socket/userSocket";
import { GameContext } from "../../socket/gameSocket";

export default function Play(){
	const checkUrl:string = "http://localhost:4242/user/check";
	const { gameroom } = useContext(GameContext);
	const history = useHistory();

	useEffect(()=>{
		axios.get(checkUrl + "?url=play", {withCredentials: true}).then((res:any)=>{
			if (res.state){
				console.log(res.state)
				if (res.state === "play" && gameroom[0].roomid){
					socket.emit("exitGameRoom", {
						roomid: gameroom[0].roomid,
					});
				}
			}
		}).catch((err)=>{
			console.log(err);
			history.replace("/");
		})
	}, []);
	return (
		<div className="container-fluid m-0 p-0 min-vh-100 min-vw-100" id="gamelobby">
			<div className="col">
				<img className="row" id="gameLogo" src={logo} alt="header"/>
				<div className="mx-1 row">
					<div className="col-md-4 col-lg-3 d-none d-sm-none d-md-block h-75">
						<SideMenuPlay></SideMenuPlay>
					</div>
					<div className="col">
						<PlayRoom></PlayRoom>
					</div>
				</div>
			</div>
		</div>
	);
}