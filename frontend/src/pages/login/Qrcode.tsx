import axios from 'axios';
import { useState, useEffect } from 'react';
import {useHistory} from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { socket } from "../../socket/socket";
import { BACK_URL } from '../../types/urlTypes';
import {gameRoomDetail} from "../../types/gameTypes";
import { RootState } from '../../redux/rootReducer';
import { initialize } from '../../redux/userReducer';
import "./Qrcode.css";

export default function Qrcode(){
	const history = useHistory();
	const dispatch = useDispatch();
	const [token, setToken] = useState<string>("");
	const [alertState, setAlert] = useState<boolean>(false);
	const checkUrl:string = BACK_URL + "/user/check";
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);

	useEffect(()=>{
		axios.get(checkUrl).then((res:any)=>{
  		if (res.state){
  		  if ((res.state === "playing" || res.state === "waiting") && gameroom.roomid){
  		    socket.emit("exitGameRoom", { roomid: gameroom.roomid });
  		    dispatch(initialize());
  		  }else if (res.state === "login"){
  		    history.replace("/game");
  		  }
  		}
		}).catch((err)=>{
			console.log(err);
			history.push("/");
		})
	}, [checkUrl, dispatch, gameroom.roomid, history]);
	
	const checkToken = ():boolean => {
		if (token.length !== 6){ return false; }
		for (let i = 0; i < token.length; i++){
			if (isNaN(parseInt(token[i]))){return false;}
		}
		return true;
	}
	const handleChange = (event:any) => { setToken(event.target.value); }
	function handleSubmit(){
		if (!checkToken()){
			setAlert(true);
		}else {
			const auth:string = BACK_URL + "/2fa/authenticate";
			axios.post(auth, { twoFactorAuthenticationCode: token }).then((res:any)=>{
				console.log(res);
				history.push("/game");
			}).catch((err:any)=>{	setAlert(true);});
		}
	}
	function handleKeypress(event: any){
		if (event.code === 'Enter'){
			event.preventDefault();
			handleSubmit()
		}
	}

	return (
		<div id="qrcode" className="container">
			<div className="col-10 col-md-8 col-lg-4" id="qrborder">
				<h1 className="row mt-2 p-1" id="qrtitle">2중 인증</h1>
				<h5 className="row justify-content-center">Google OTP 숫자를 입력해주세요.</h5>
				<div className="row m-1 mt-4">
					<input className="col-8" id="qrinput" placeholder="OTP Number without space." onChange={handleChange} onKeyPress={handleKeypress}></input>	
					<div className="col btn m-1" id="qrbutton" onClick={handleSubmit}>확인</div>
				</div>
				<div className="row mt-1">
					{ !alertState ? "" :
						<div className="alert alert-danger m-1" role="alert">OTP 숫자를 다시 확인해주세요! ex) 123456, ...</div>
					}	
				</div>
			</div>
		</div>
	);
}