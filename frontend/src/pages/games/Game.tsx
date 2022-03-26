import Lobby from "./Lobby"
import Modal from "react-modal"
import { Route, Switch, useHistory } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { ChatContext, ChatData } from "../../context/chatContext"
import { socket, UserContext, User } from "../../context/userContext"
import { GameContext, gameRoomDetail, match, playRoom } from "../../context/gameContext"
import WaitingRoom from "./WaitingRoom"
import SideMenuGame from "./SideMenuGame"
import SideMenuChat from "../../components/chat/SideMenuChat"
import MatchRequestModal from "../../components/modals/MatchRequestModal"

import "./Game.css"
import logo from "../../icons/logo_brown_profile.png"

import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {updateUser} from "../../redux/userReducer"
import {RootState} from "../../redux/rootReducer"
import { gameRoomInitialState, updateGameRoom } from "../../redux/gameReducer"

type message = {
	message: string,
};

Modal.setAppElement("#root");
export default function Game() {
	const history = useHistory();
	// const { gameroom, playroom } = useContext(GameContext);
	// const { user } = useContext(UserContext);
	// const {chatroom} = useContext(ChatContext);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [matchData, setMatch] = useState<match>();

	const user:User = useSelector((state:RootState) => state.userReducer, shallowEqual);
	const gameroom:gameRoomDetail = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	const playroom:playRoom = useSelector((state:RootState) => state.gameReducer.playroom, shallowEqual);
	const chatroom:ChatData = useSelector((state:RootState) => state.chatReducer.chatroom, shallowEqual);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!user || user.nickname === "") {
			console.log("user Info emit!")
			socket.emit("userInfo");
		}
		socket.on("userInfo", (data:User) => {
			console.log("user Info is changed!");
			// user[1](data);
			dispatch(updateUser(data));
		});
		socket.on("enterGameRoom", (msg: gameRoomDetail | message) => {
			console.log("enter game room");
			// console.log(msg);
			if ("message" in msg) {
				alert("fail to enter the room!");
				if (history.location.pathname.search("waiting")){
					history.replace("/game");
				}
			}else {
				// gameroom[1](msg);
				dispatch(updateGameRoom(msg));
				console.log("path = ", history.location.pathname);
				if (history.location.pathname.indexOf("waiting") === -1){
					history.push(`${history.location.pathname}/waiting/${msg.roomid}`);
				}
			}
		});
		socket.on("exitGameRoom", () => {
			// gameroom[1](undefined)
			dispatch(updateGameRoom(gameRoomInitialState));
			history.push("/game");
		});
		socket.on("startGame", (msg:any) => {
			console.log("start game!");
			if (msg.result) {
				alert("failed to play the game!");
			} else {
				// playroom[1](msg);
				dispatch(updateGameRoom(msg));
				history.push(`/game/play/${msg.roomid}`);
			}
		});
		socket.on("matchResponse", (data:match) => {
			setIsOpen(true);
			setMatch(data);
		})
	}, [chatroom, gameroom, history, playroom, user]);
	return (
		<div className="container-fluid m-0 p-0" id="gamelobby">
			<div className="col" id="gamelobbyCol">
				<img className="row" id="gameLogo" src={logo} alt="header" />
				<div className="row m-0 p-1" id="gamePad">
					<div className="col-xs-12 col-md-4 col-lg-3 d-sm-none d-md-block" id="gamelobbySide">
						<Switch>
							<Route path="/game/chat" component={SideMenuChat}></Route>
							<Route path="/game" component={SideMenuGame}></Route>
						</Switch>
					</div>
					<div className="col d-none d-sm-block m-0 p-0 border">
						<Switch>
							<Route path="/game/waiting/:id" component={WaitingRoom}></Route>
							<Route path="/game/chat/:idx/waiting/:id" component={WaitingRoom}></Route>
							<Route path="/game/chat/waiting/:id" component={WaitingRoom}></Route>
							<Route path="/game" component={Lobby}></Route>
						</Switch>
					</div>
				</div>
			</div>
			<Modal isOpen={isOpen} style={customStyles}>
				<MatchRequestModal setIsOpen={setIsOpen} matchData={matchData} />
			</Modal>
		</div>
	);
}

const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		padding: '0',
		transform: 'translate(-50%, -50%)',
		border: '1px solid #C9A641',
		borderRadius: '25px',
	},
};