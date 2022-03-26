import axios from "axios";
import MenuGame from "../../components/games/MenuGame"
import {useState, useContext, useEffect} from "react"
import { Link, useHistory } from "react-router-dom"
import {socket, UserContext, Friend, User} from "../../context/userContext";
import { GameContext, gameRoomDetail } from "../../context/gameContext";
import ProfileModal from "../../components/modals/ProfileModal";
import MyProfileModal from "../../components/modals/MyProfileModal";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { updateUser } from "../../redux/userReducer";

export default function SideMenuGame(){
	const history = useHistory();
	// const { user } = useContext(UserContext);
	// const { gameroom } = useContext(GameContext);
	const [clicked, setClicked] = useState<string>("");
	// const back_url:string = "http://localhost:4242";
	const back_url:string = "";
	const checkUrl:string = back_url + "/user/check";

	const dispatch = useDispatch();
	const user:User = useSelector((state:RootState) => state.userReducer, shallowEqual);
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	
	useEffect(()=>{
		axios.get(checkUrl + "?url=sideMenuGame").then((res:any)=>{
			console.log("menu game here!!");
			if (res.state){
				console.log(res.state)
				if (res.state === "play" && gameroom.roomid){
					socket.emit("exitGameRoom", { roomid: gameroom.roomid });
				}else if (res.state === "logout"){ history.replace("/"); }
			}
		}).catch((err)=>{
			console.log(err);
			history.replace("/");
		});
		socket.on("newFriend", (data:Friend)=>{
			const tmp:User = user;
			tmp.newfriends?.push(data);
			// user[1](tmp);
			dispatch(updateUser(tmp));
		});
		socket.on("addFriend", (data:Friend)=>{
			const tmp:User = user;
			console.log("user = ", user);
			tmp.friends?.push(data);
			// user[1](tmp);
			dispatch(updateUser(tmp));
		});
		socket.on("deleteFriend", (data:Friend)=>{
			const tmp:User = user;
			tmp.friends = tmp.friends.filter((friend:Friend)=>friend.userid !== data.userid);
			// user[1](tmp);
			dispatch(updateUser(tmp));
		});
		socket.on("blockFriend", (data:Friend)=>{
			const tmp:User = user;
			tmp.blacklist?.push(data);
			// user[1](tmp);
			dispatch(updateUser(tmp));
		});
		socket.on("updateProfile", (data:any)=>{
			const tmp:User = user;
			if (data.nickname){
				tmp.nickname = data.nickname;
			}
			if (data.profile){
				tmp.profile = data.profile;
			}
			// user[1](tmp);
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
			<div className="row" id="nav-game">
				<MenuGame setClicked={setClicked}></MenuGame>
			</div>
			<MyProfileModal setClicked={setClicked}/>
			<ProfileModal userid={clicked}/>
		</div>
	);
}