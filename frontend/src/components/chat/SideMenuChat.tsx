import { useEffect } from "react"
import { Switch, Route, Link, useParams } from "react-router-dom"
import { shallowEqual, useSelector } from "react-redux";
import { ChatData } from "../../types/chatTypes";
import { gameRoomDetail } from "../../types/gameTypes";
import { RootState } from "../../redux/rootReducer";
import MenuChat from "../../components/chat/MenuChat"
import ChatRoom from "../../components/chat/ChatRoom"
import "./chat.css";

type param = { id?: String }

export default function SideMenuChat(){
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);

	useEffect(()=>{
		console.log("sideMenuChat");
	});

	const ChatRoomIdx = () => {
		let idx:param = useParams();
		return <ChatRoom idx={idx.id ? idx.id.toString():""} room={chatroom}></ChatRoom>
	}

	return (
		<div id="chatTab">
			<div className="row">
				<div className="col-3 btn" id="tab-game">
					<Link to={`/game${gameroom.roomid !== "" ? `/waiting/${gameroom.roomid}`: ""}`} className="text-decoration-none text-reset">game</Link>
				</div>
				<div className="col-3 btn" id="tab-chat-active">
					<Link to={`/game/chat${gameroom.roomid !== "" ? `/waiting/${gameroom.roomid}`: ""}`} className="text-decoration-none text-reset">chat</Link>
				</div>
			</div>
			<div className="row" id="nav-chat">
				<Switch>
					<Route path="/game/chat/waiting/:id" component={MenuChat}></Route>
					<Route path="/game/chat/:id" component={ChatRoomIdx}></Route>
					<Route path="/game/chat" component={MenuChat}></Route>
				</Switch>
			</div>
		</div>
	);
}