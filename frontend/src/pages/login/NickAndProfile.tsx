import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import AlertModal from "../../components/modals/AlertModal";
import ProfileCarousel from "../../components/login/ProfileCarousel";
import { socket, UserContext } from "../../socket/userSocket";
import { GameContext } from "../../socket/gameSocket";
import "./NickAndProfile.css";

export default function NickAndProfile(){
	const history = useHistory();
	const [profile, setProfile] = useState<number>(0);
	const [nickname, setNickname] = useState<string>("");
	const [checkModalText, setCheckModalText] = useState<string>("ERROR");
	const nicknamePlaceholder:string = "2~12 characters only";
	const btn = document.querySelector("#okBtn");
	const checkUrl:string = "/user/check";
	const {user} = useContext(UserContext);
	const { gameroom } = useContext(GameContext);
	const doubleCheck:string = "중복 확인 해주세요!";
	const possible:string = "사용 가능한 닉네임입니다.";
	const impossible:string = "사용 불가능한 닉네임입니다.";

	useEffect(()=>{
		axios.get(checkUrl).then((res:any)=>{
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
			history.push("/");
		})
	}, []);
	const handleInput = (event: any) => {
		setNickname(event.target.value);
		if (btn && !btn.getAttribute("data-toggle")){
			btn.setAttribute("data-toggle", "modal");
			btn.setAttribute("data-target", "#okModal");
			setCheckModalText(doubleCheck);
		}
	}
	const handleCheck = (event : any) => {
		event.preventDefault();
		axios.get(`/auth/check?nickname=${nickname}`)
			.then(res=>{
				console.log(res.data);
				if (res.data.message === false){
					setCheckModalText(possible);
					if (btn){
						btn.removeAttribute("data-toggle");
						btn.removeAttribute("data-target");
					}
				}else{
					setCheckModalText(impossible);
				}
			}).catch(error=>{console.log(error)});
	}
	const handleOK = (event: any) => {
		event.preventDefault();
		if (conditionals() === false){
			setCheckModalText(doubleCheck);
			return ;
		}
		axios.post(`/auth/signup`, { nickname, profile })
		.then(res=>{
			console.log(res);
			console.log(res.data);
			if (res.data){
				if (user[0]){
					let tmp = user[0];
					tmp.profile = profile;
					tmp.nickname = nickname;
					user[1](tmp);
				}
				history.push("/game");
			}
		}).catch(err=>{
			console.error(err);
		});
	}
	const handleCancel = (event: any) => {
		event.preventDefault();
		history.push("/");
	}
	const conditionals = (): Boolean => {
		if (nickname === "")
			return false;
		else if (checkModalText !== possible)
			return false;
		return true;
	}

	return (
		<div id='nickandprofile'>
			<form>
				<ProfileCarousel profile={profile} setProfile={setProfile}></ProfileCarousel>
				<div className="d-flex my-2">
					<label className="m-2" id="nickLabel">Nickname</label>
					<input className="m-1" id="nickInput" placeholder={nicknamePlaceholder} onChange={handleInput} required />
					<button className="btn m-1" id="checkBtn" data-toggle="modal" data-target="#alertModal" onClick={handleCheck}>Check</button>
				</div>
				<div>
					<button className="btn m-1" id="okBtn" type="submit" data-toggle="modal" data-target="#alertModal" onClick={handleOK}>OK</button>
					<button className="btn m-1" id="cancelBtn" type="submit" onClick={handleCancel}>Cancel</button>
				</div>
				<AlertModal content={checkModalText}></AlertModal>
			</form>
		</div>
	);
}