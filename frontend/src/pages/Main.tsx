import axios from "axios";
import { useContext, useEffect, useState } from "react";
import logo_brown from "../icons/logo_brown.png"
import { socket } from "../context/userContext";
import { GameContext, gameRoomDetail } from "../context/gameContext";
import {User} from "../context/userContext";
import "./Main.css";

import { useHistory } from "react-router";
import { RootState } from "../redux/rootReducer";
import { shallowEqual, useSelector } from "react-redux";

export default function Main(){
	const front_url:string = "http://localhost:3000";
	const back_url:string = "http://localhost:4242";
	const login:string = "/auth/login";
	const check:string = "/user/check";
	// const {gameroom} = useContext(GameContext);
	// const dispatch = useDispatch();
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const [nick, setNick] = useState<string>("");
	const history = useHistory();

	useEffect(()=>{
		axios.get(check + "?url=main").then((res:any)=>{
			// console.log("checked!");
			// console.log(res.state);
			if (res.state){
				console.log(res.state);
				if (res.state === "play" && gameroom.roomid){
					socket.emit("exitGameRoom", { roomid: gameroom.roomid });
				}
			}
		}).catch((err)=>{ console.log(err); })
	}, [gameroom]);

	const handleInput = (event:any) => { setNick(event.target.value); }
	const handleTest = () => {
		console.log(nick);
		axios.post("/auth/force_login", {
			nickname: nick
		}).then((res)=>{
			if (res.data === true){ history.push("/game");
			}else { history.push("/twofactor"); }
		});
	}
	return (
		<div className="container text-center" id="main">
			<div className="col w-100">
				<img className="row mt-4" id="logo" src={logo_brown} alt="logo"/>
				<div className="row m-2">
					<input className="col mx-2" placeholder="nickname" onChange={handleInput}/>
					<div className="col btn btn-outline-primary mx-1" onClick={handleTest}>check</div>
				</div>
				<a className="row btn" id="loginButton" href={login} role="button">LOG IN</a>
			</div>
		</div>
	);
}