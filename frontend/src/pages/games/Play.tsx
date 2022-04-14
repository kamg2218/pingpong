import axios from "axios";
import { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { socket } from "../../socket/socket";
import SideMenuPlay from "./SideMenuPlay"
import PlayRoom from "../../components/play/PlayRoom"
import { useDispatch, useSelector } from "react-redux";
import { BACK_URL } from "../../types/urlTypes";
import { gameRoomDetail } from "../../types/gameTypes";
import { RootState } from "../../redux/rootReducer";
import { initialize } from "../../redux/userReducer";
import "./Play.css";
import logo from '../../icons/logo_brown_profile.png'

export default function Play(){
	const checkUrl:string = BACK_URL + "/user/check";
	const history = useHistory();
	const param:any = useParams();
	const dispatch = useDispatch();
	const gameroom:gameRoomDetail = useSelector((state:RootState)=>state.gameReducer.gameroom);

	useEffect(()=>{
		axios.get(checkUrl + "?url=play").then((res:any)=>{
			console.log("----->", res.data.state);
  		if (res.data.state){
				if (res.data.state === "playing" && gameroom.roomid === ""){
					dispatch(initialize());
					history.replace("/game");
				}else if (res.data.state === "playing" && gameroom.roomid !== param.id){
					socket.emit("exitGameRoom", {roomid: gameroom.roomid});
				}else if (res.data.state === "waiting" && gameroom.roomid){
					socket.emit("exitGameRoom", {roomid: gameroom.roomid});
				}else if (res.data.state === "login" || res.data.state === "waiting"){
					dispatch(initialize());
					history.replace("/game");
				}else if (res.data.state === "logout"){
					dispatch(initialize());
					history.replace("/");
				}
  		}
		}).catch((err)=>{
			console.log(err);
			history.replace("/");
		});
	}, [checkUrl, dispatch, gameroom.roomid, history, param.id]);

	return (
		<div className="container-fluid" id="playroom">
			<div className="col h-100">
				<img className="row" id="gameLogo" src={logo} alt="header"/>
				<div className="row" id="gameScreen">
					<div className="col-md-4 col-lg-3 d-none d-sm-none d-md-block" id="sideMenuPlay"><SideMenuPlay/></div>
					<div className="col" id="playRoom"><PlayRoom/></div>
				</div>
			</div>
		</div>
	);
}