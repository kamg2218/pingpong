import axios from "axios";
import { useHistory } from "react-router";
import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { socket } from "../socket/socket";
import { gameRoomDetail } from "../types/gameTypes";
import { RootState } from "../redux/rootReducer";
import logo_brown from "../icons/logo_brown.png"
import "./Main.css";
import { initialize } from "../redux/userReducer";

export default function Main(){
	const login:string = "/auth/login";
	const check:string = "/user/check";

	const history = useHistory();
	const dispatch = useDispatch();
	const [nick, setNick] = useState<string>("");
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);

	useEffect(()=>{
		console.log(socket);
		dispatch(initialize());
		axios.get(check + "?url=main").then((res:any)=>{
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
			if (res.data === true){ history.push("/game");}
			else { history.push("/twofactor"); }
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