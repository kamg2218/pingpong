import axios from "axios";
import { useContext, useEffect } from "react";
import logo_brown from "../icons/logo_brown.png"
import { socket } from "../socket/userSocket";
import { GameContext } from "../socket/gameSocket";
import "../css/Main.css";

export default function Main(){
	const login:string = "/auth/login";
	const check:string = "/user/check";
	const {gameroom} = useContext(GameContext);

	useEffect(()=>{
		axios.get(check + "?url=main").then((res:any)=>{
			console.log("checked!");
			console.log(res.state);
			if (res.state){
				console.log(res.state);
				if (res.state === "play" && gameroom[0].roomid){
					socket.emit("exitGameRoom", {
						roomid: gameroom[0].roomid,
					});
				}
			}
		}).catch((err)=>{
			console.log(err);
		})
	}, []);
	return (
		<div className="container text-center" id="main">
			<div className="col">
				<img className="row mt-4" id="logo" src={logo_brown} alt="logo"/>
				<a className="row btn btn-outline-primary mx-2" id="loginButton" href={login} role="button">LOG IN</a>
			</div>
		</div>
	);
}