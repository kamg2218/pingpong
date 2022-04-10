import axios from "axios";
import { useEffect, useState } from "react"
import { Link, useHistory } from "react-router-dom"
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
import { BACK_URL } from "../../types/urlTypes";
import { Friend, User } from "../../types/userTypes";
import { gameRoomDetail } from "../../types/gameTypes";
import { RootState } from "../../redux/rootReducer";
import { initialize, updateUser } from "../../redux/userReducer";
import MenuGame from "../../components/games/MenuGame"

export default function SideMenuGame(){
	const history = useHistory();
	const checkUrl:string = BACK_URL + "/user/check";
	const dispatch = useDispatch();
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const [userState, setUser] = useState<User>(user);

	useEffect(()=>{
		console.log("side menu game here!!");
		axios.get(checkUrl + "?url=sideMenuGame").then((res:any)=>{
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

		// socket.on("newFriend", (data:Friend)=>{
		// 	console.log("newFriend", data);
		// 	const tmp:User = userState;
		// 	const idx:number = tmp.newfriends.findIndex((friend:Friend)=>friend.userid === data.userid);
		// 	if (idx === -1){
		// 		tmp.newfriends.push(data);
		// 		dispatch(updateUser(tmp));
		// 		setUser(tmp);
		// 	}
		// });
		// socket.on("addFriend", (data:Friend)=>{
		// 	console.log("addFriend", data);
		// 	const tmp:User = userState;
		// 	const idx:number = tmp.friends.findIndex((friend:Friend)=>friend.userid === data.userid);
		// 	if (idx === -1){
		// 		tmp.friends.push(data);
		// 		dispatch(updateUser(tmp));
		// 		setUser(tmp);
		// 	}
		// });
		// socket.on("deleteFriend", (data:Friend)=>{
		// 	console.log("deleteFriend", data);
		// 	const tmp:User = userState;
		// 	tmp.friends = tmp.friends.filter((friend:Friend)=>friend.userid !== data.userid);
		// 	dispatch(updateUser(tmp));
		// 	setUser(tmp);
		// });
		// socket.on("blockFriend", (data:Friend)=>{
		// 	console.log("blockFriend", data);
		// 	const tmp:User = userState;
		// 	const idx:number = tmp.blacklist.findIndex((friend:Friend)=>friend.userid === data.userid);
		// 	if (idx === -1){
		// 		tmp.blacklist.push(data);
		// 		dispatch(updateUser(tmp));
		// 		setUser(tmp);
		// 	}
		// });
		// socket.on("updateProfile", (data:any)=>{
		// 	const tmp:User = userState;
		// 	if (data.nickname){ tmp.nickname = data.nickname; }
		// 	if (data.profile){ tmp.profile = data.profile; }
		// 	dispatch(updateUser(tmp));
		// 	setUser(tmp);
		// });
		// return ()=>{
			// socket.off("newFriend");
			// socket.off("addFriend");
			// socket.off("deleteFriend");
			// socket.off("blockFriend");
			// socket.off("updateProfile");
		// }
	}, [checkUrl, dispatch, gameroom, history, userState, userState.newfriends, userState.friends, user]);

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
			<div className="row" id="nav-game"><MenuGame/></div>
		</div>
	);
}