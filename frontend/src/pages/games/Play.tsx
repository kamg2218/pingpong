import SideMenuPlay from "./SideMenuPlay"
import PlayRoom from "../../components/play/PlayRoom"
import logo from '../../icons/logo_brown_profile.png'
import axios from "axios";
import { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { socket } from "../../socket/userSocket";
import { GameContext } from "../../socket/gameSocket";
import "./Play.css";

export default function Play(){
	// const back_url:string = "http://localhost:4242";
	const back_url:string = "";
	const checkUrl:string = back_url + "/user/check";
	const { gameroom } = useContext(GameContext);
	const history = useHistory();

	useEffect(()=>{
		axios.get(checkUrl + "?url=play").then((res:any)=>{
			if (res.state){
				console.log(res.state)
				if (res.state === "play" && gameroom[0].roomid){
					socket.emit("exitGameRoom", {
						roomid: gameroom[0].roomid,
					});
				}else if (res.state === "logout"){
					history.replace("/");
				}
			}
		}).catch((err)=>{
			console.log(err);
			history.replace("/");
		})
	}, []);
	return (
		<div className="container-fluid m-0 p-0" id="playroom">
			<div className="col h-100">
				<img className="row" id="gameLogo" src={logo} alt="header"/>
				<div className="row m-0 p-1" id="gameScreen">
					<div className="col-md-4 col-lg-3 d-none d-sm-none d-md-block">
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