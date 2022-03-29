import axios from "axios";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import SideMenuPlay from "./SideMenuPlay"
import PlayRoom from "../../components/play/PlayRoom"
import { useDispatch, useSelector } from "react-redux";
import { gameRoomDetail } from "../../types/gameTypes";
import { RootState } from "../../redux/rootReducer";
import { initialize } from "../../redux/userReducer";
import "./Play.css";
import logo from '../../icons/logo_brown_profile.png'

export default function Play(){
	// const back_url:string = "http://localhost:4242";
	const back_url:string = "";
	const checkUrl:string = back_url + "/user/check";
	const history = useHistory();
	const dispatch = useDispatch();
	const gameroom:gameRoomDetail = useSelector((state:RootState)=>state.gameReducer.gameroom);

	useEffect(()=>{
		axios.get(checkUrl + "?url=play").then((res:any)=>{
  		if (res.state){
				if (res.state === "playing"){
					return ;
				}else if (res.state === "waiting"){
					history.replace("/game/waiting/" + gameroom.roomid);
				}else if (res.state === "login"){
					dispatch(initialize());
					history.replace("/game");
				}
  		}
		}).catch((err)=>{
			console.log(err);
			history.replace("/");
		});
	}, [checkUrl, history]);

	return (
		<div className="container-fluid m-0 p-0" id="playroom">
			<div className="col h-100">
				<img className="row" id="gameLogo" src={logo} alt="header"/>
				<div className="row m-0 p-1" id="gameScreen">
					<div className="col-md-4 col-lg-3 d-none d-sm-none d-md-block"><SideMenuPlay/></div>
					<div className="col"><PlayRoom/></div>
				</div>
			</div>
		</div>
	);
}