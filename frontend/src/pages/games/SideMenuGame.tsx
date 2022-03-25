import axios from "axios";
import MenuGame from "../../components/games/MenuGame"
import {useState, useContext, useEffect} from "react"
import { Link, useHistory } from "react-router-dom"
import {socket, UserContext, Friend, User} from "../../context/userContext";
import { GameContext } from "../../context/gameContext";
import ProfileModal from "../../components/modals/ProfileModal";
import MyProfileModal from "../../components/modals/MyProfileModal";

export default function SideMenuGame(){
	const history = useHistory();
	const { user } = useContext(UserContext);
	const { gameroom } = useContext(GameContext);
	const [clicked, setClicked] = useState<string>("");
	// const back_url:string = "http://localhost:4242";
	const back_url:string = "";
	const checkUrl:string = back_url + "/user/check";

	useEffect(()=>{
		axios.get(checkUrl + "?url=sideMenuGame").then((res:any)=>{
			console.log("menu game here!!");
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
			history.replace("/");
		});
		// if (user[0] === undefined){
		// 	socket.emit("userInfo");
		// }
		socket.on("newFriend", (data:Friend)=>{
			const tmp:User = user[0];
			tmp.newfriends?.push(data);
			user[1](tmp);
		});
		socket.on("addFriend", (data:Friend)=>{
			const tmp:User = user[0];
			console.log("user = ", user[0]);
			tmp.friends?.push(data);
			user[1](tmp);
		});
		socket.on("deleteFriend", (data:Friend)=>{
			const tmp:User = user[0];
			tmp.friends = tmp.friends.filter((friend:Friend)=>friend.userid !== data.userid);
			user[1](tmp);
		});
		socket.on("blockFriend", (data:Friend)=>{
			const tmp:User = user[0];
			tmp.blacklist?.push(data);
			user[1](tmp);
		});
		socket.on("updateProfile", (data:any)=>{
			const tmp:User = user[0];
			if (data.nickname){
				tmp.nickname = data.nickname;
			}
			if (data.profile){
				tmp.profile = data.profile;
			}
			user[1](tmp);
		});
	}, []);
	return (
		<div id="gameTab">
			<div className="row">
				<div className="col-3 btn" id="tab-game-active">
					<Link to={`/game${gameroom[0] ? `/waiting/${gameroom[0].roomid}`: ""}`} className="text-decoration-none text-reset">game</Link>
				</div>
				<div className="col-3 btn" id="tab-chat">
					<Link to={`/game/chat${gameroom[0] ? `/waiting/${gameroom[0].roomid}`: ""}`} className="text-decoration-none text-reset">chat</Link>
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