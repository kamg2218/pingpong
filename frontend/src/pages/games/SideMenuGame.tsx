import axios from "axios";
import { useState, useEffect } from "react"
import { Link, useHistory } from "react-router-dom"
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
import { BACK_URL } from "../../types/urlTypes";
import { Friend, User } from "../../types/userTypes";
import { gameRoomDetail } from "../../types/gameTypes";
import { RootState } from "../../redux/rootReducer";
import { initialize, updateUser } from "../../redux/userReducer";
import MenuGame from "../../components/games/MenuGame"
import ProfileModal from "../../components/modals/ProfileModal";
import MyProfileModal from "../../components/modals/MyProfileModal";

export default function SideMenuGame(){
	const history = useHistory();
	const [clicked, setClicked] = useState<string>("");
	const checkUrl:string = BACK_URL + "/user/check";

	const dispatch = useDispatch();
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	
	useEffect(()=>{
		axios.get(checkUrl + "?url=sideMenuGame").then((res:any)=>{
			console.log("menu game here!!");
			const url:string = history.location.pathname;
  		const idx:number = url.search("wait");

  		if (res.state){
  		  if (res.state === "playing" && gameroom.roomid){
  		    socket.emit("exitGameRoom", { roomid: gameroom.roomid });
					dispatch(initialize());
					history.replace("/game");
  		  }else if (res.state === "waiting" && idx === -1){
  		    socket.emit("exitGameRoom", { roomid: gameroom.roomid });
					dispatch(initialize());
  		  }else if (res.state === "login" && idx !== -1){
					dispatch(initialize());	
					history.replace("/game");
  		  }else if (res.state === "logout"){
  		    history.replace("/");
  		  }
  		}
		}).catch((err)=>{
			console.log(err);
			history.replace("/");
		});
		socket.on("newFriend", (data:Friend)=>{
			const tmp:User = user;
			tmp.newfriends.push(data);
			dispatch(updateUser(tmp));
		});
		socket.on("addFriend", (data:Friend)=>{
			const tmp:User = user;
			tmp.friends.push(data);
			dispatch(updateUser(tmp));
		});
		socket.on("deleteFriend", (data:Friend)=>{
			const tmp:User = user;
			tmp.friends = tmp.friends.filter((friend:Friend)=>friend.userid !== data.userid);
			dispatch(updateUser(tmp));
		});
		socket.on("blockFriend", (data:Friend)=>{
			const tmp:User = user;
			tmp.blacklist.push(data);
			dispatch(updateUser(tmp));
		});
		socket.on("updateProfile", (data:any)=>{
			const tmp:User = user;
			if (data.nickname){ tmp.nickname = data.nickname; }
			if (data.profile){ tmp.profile = data.profile; }
			dispatch(updateUser(tmp));
		});
	}, [checkUrl, gameroom, history, user]);
	return (
		<div id="gameTab">
			<div className="row">
				<div className="col-3 btn" id="tab-game-active">
					<Link to={`/game${gameroom.roomid !== "" ? `/waiting/${gameroom.roomid}`: ""}`} className="text-decoration-none text-reset">game</Link>
				</div>
				<div className="col-3 btn" id="tab-chat">
					<Link to={`/game/chat${gameroom.roomid !== "" ? `/waiting/${gameroom.roomid}`: ""}`} className="text-decoration-none text-reset">chat</Link>
				</div>
			</div>
			<div className="row" id="nav-game"><MenuGame setClicked={setClicked}/></div>
			<MyProfileModal setClicked={setClicked}/>
			<ProfileModal userid={clicked}/>
		</div>
	);
}