import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket/socket"
import { Friend, User } from "../../types/userTypes"
import { RootState } from "../../redux/rootReducer";
import { updateUser } from "../../redux/userReducer";
import Profile from "../../icons/Profile"
import "./MenuGame.css"

export default function MenuGame(){
	const dispatch = useDispatch();
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);
	const [userState, setUser] = useState<User>(user);
	
	useEffect(()=>{
		console.log("MenuGame");
		socket.on("userInfo", (data:User)=>{
			setUser(data);
		});
		socket.on("newFriend", (data:Friend)=>{
			console.log("newFriend", data);
			const tmp:User = userState;
			const idx:number = tmp.newfriends.findIndex((friend:Friend)=>friend.userid === data.userid);
			if (idx === -1){
				tmp.newfriends.push(data);
				setUser(tmp);
				dispatch(updateUser(tmp));
			}
		});
		socket.on("addFriend", (data:Friend)=>{
			console.log("addFriend", data);
			const tmp:User = userState;
			const idx:number = tmp.friends.findIndex((friend:Friend)=>friend.userid === data.userid);
			if (idx === -1){
				tmp.friends.push(data);
				setUser(tmp);
				dispatch(updateUser(tmp));
			}
		});
		socket.on("deleteFriend", (data:Friend)=>{
			console.log("deleteFriend", data);
			const tmp:User = userState;
			tmp.friends = tmp.friends.filter((friend:Friend)=>friend.userid !== data.userid);
			setUser(tmp);
			dispatch(updateUser(tmp));
		});
		socket.on("blockFriend", (data:Friend)=>{
			console.log("blockFriend", data);
			const tmp:User = userState;
			const idx:number = tmp.blacklist.findIndex((friend:Friend)=>friend.userid === data.userid);
			if (idx === -1){
				tmp.blacklist.push(data);
				setUser(tmp);
				dispatch(updateUser(tmp));
			}
		});

		return ()=>{
			socket.off("userInfo");
			socket.off("newFriend");
			socket.off("addFriend");
			socket.off("deleteFriend");
			socket.off("blockFriend");
		}
	}, [dispatch, user, userState, userState.newfriends, userState.friends]);

	const NewList = (person: Friend) => {
		const handleNewFriend = (result: boolean) => {
			socket.emit("newFriend", { userid: person.userid, result: result });
			let tmp:User = userState;
			tmp.newfriends = tmp.newfriends.filter((friend:Friend)=>friend.userid !== person.userid);
			dispatch(updateUser(tmp));
			setUser(tmp);
		}
		return (
			<div id="newfriend" key={person.userid}>
				<div className="col-2" key={`${person.userid}_img`}><img src={Profile(person.profile)} alt="profile" id="friendProfile"/></div>
				<div className="col-5 m-0 mx-1 px-2 h6" id="friendNick">{person.nickname}</div>
				<i className="col-2 bi bi-check-lg px-2" id="checkMark" onClick={()=>handleNewFriend(true)}/>
				<i className="col-2 bi bi-x-lg px-2" id="crossMark" onClick={()=>handleNewFriend(false)}/>
			</div>
		);
	}

	const OldList = (person: Friend) => {
		const handleProfileClick = () => {
			socket.emit("opponentProfile", { userid: person.userid });
		}
		return (
			<div id="oldfriend" key={person.userid} onClick={handleProfileClick} data-toggle="modal" data-target="#profileModal">
				<div className="col-2" key={`${person.userid}_img`}><img src={Profile(person.profile)} alt="profile" id="friendProfile"/></div>
				<div className="col-8 m-0 mx-1 px-2 h6" id="friendNick">{person.nickname}</div>
				<div className="col">{person.onoff ? <div className="circle bg-danger"/> : <div className="circle bg-light" id="light-circle"/>}</div>
			</div>
		);
	}
	const handleMyProfileClick = () => {
		socket.emit("userInfo");
	}

	return (
		<div id="menuGame">
			<img src={Profile(userState?.profile ? userState.profile : 0)} alt="profile" id="menuGameProfile"/>
			<div className="h2" id="menuNick" data-toggle="modal" data-target="#myProfileModal" onClick={handleMyProfileClick}>{userState?.nickname}</div>
			<label id="menuRecord">WIN : LOSE</label>
			<div className="h1" id="winLose">{userState?.win} : {userState?.lose}</div>
			<div id="friendList">
				{userState && userState.newfriends?.map((people:Friend) => (NewList(people)))}
				{userState && userState.friends?.map((people:Friend) => (OldList(people)))}
			</div>
		</div>
	);
}