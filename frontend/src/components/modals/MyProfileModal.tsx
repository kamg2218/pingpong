import { useContext, useEffect, useState } from "react";
import { socket, UserContext, User, Friend } from "../../socket/userSocket";
import Profile from '../../icons/Profile'
import MatchHistory from "../games/MatchHistory";
import "./profileModal.css"
import axios from "axios";

export default function MyProfileModal(props: any) {
	const userContext = useContext(UserContext);
	const profile:User = userContext.user[0];
	const [code, setCode] = useState<boolean>(false);
	const [state, setState] = useState<boolean>(false);
	const [qrcode, setQrcode] = useState<string>("");
	const [num, setNum] = useState<string>("");

	useEffect(() => {
	}, [qrcode]);

	const handleInput = (event:any) => {
		setNum(event.target.value);
	}
	const handleSubmit = () => {
		const url:string = "http://localhost:4242/2fa/turn-on";
		if (num.length !== 4){
			return ;
		}
		console.log(num);
		axios.post(url).then((res:any)=>{
			console.log(res)
			setState(false);
		}).catch((err:any)=>{console.log(err)});
	}
	const handleQrcode = () => {
		const url:string = "http://localhost:4242/2fa";
		if (!code){
			setState(true);
			axios.post(url + "/generate").then((res:any)=>{
				console.log(res.data);
				setQrcode(res.data);
			}).catch((err:any)=>{console.log(err)});
		}else {
			setState(false);
			axios.post(url + "/turn-off").then((res:any)=>{
				console.log(res)
			}).catch((err:any)=>{console.log(err)});
		}
		setCode(!code);
	}
	const handleClick = (userid: string) => {
		props.setClicked(userid);
	}
	const friendList = () => {
		let list:any = [];

		const acceptNewFriend = (userid: string)=>{
			socket.emit("newFriend", {
				userid: userid,
				result: true
			})
		}
		const declineNewFriend = (userid: string)=>{
			socket.emit("newFriend", {
				userid: userid,
				result: false
			})
		}
		profile?.newfriends.forEach((friend:Friend)=>{
			list.push(
				<div className="row mx-0 px-2" id="newFriendContent" onClick={()=>handleClick(friend.userid)}>
					<div className="col p-0"><img src={Profile(friend.profile)} alt="profile" id="friendProfile"/></div>
					<div className="col">{friend.nickname}</div>
					<div className="col-2"><i className="bi bi-check-lg" id="checkMark" onClick={()=>acceptNewFriend(friend.userid)}/></div>
					<div className="col-2"><i className="bi bi-x-lg" id="crossMark" onClick={()=>declineNewFriend(friend.userid)}/></div>
				</div>
			)
		})
		profile?.friends.forEach((friend:Friend)=>{
			list.push(
				<div className="row text-center align-items-center" id="friendContent" data-dismiss="modal" data-toggle="modal" data-target="#ProfileModal" onClick={()=>handleClick(friend.userid)}>
					<div className="col"><img src={Profile(friend.profile)} alt="profile" id="friendProfile"/></div>
					<div className="col">{friend.nickname}</div>
					<div className="col">{friend.onoff ? <div className="circle bg-danger"/> : <div className="circle bg-light"/>}</div>
				</div>
			);
		})
		return list;
	}
	const blockList = () => {
		let list:any = [];
		profile?.blacklist.forEach((friend:Friend)=>{
			list.push(
				<div className="row text-center align-items-center" id="friendContent" data-dismiss="modal" data-toggle="modal" data-target="#ProfileModal" onClick={()=>handleClick(friend.userid)}>
					<div className="col"><img src={Profile(friend.profile)} alt="profile" id="friendProfile"/></div>
					<div className="col">{friend.nickname}</div>
					<div className="col">{friend.onoff ? <div className="circle bg-danger"/> : <div className="circle bg-light"/>}</div>
				</div>
			)
		})
		return list;
	}
	return (
		<div className="modal fade" id="MyProfileModal" role="dialog" tabIndex={-1} aria-labelledby="MyProfileModalLabel" aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">내 프로필</h5>
						<button type="button" className="btn modal-button" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div className="modal-body">
						<div className="container p-1">
							<div className="col">
								<div className="row mb-2">
									<div className="col m-0 p-0"><img src={Profile(profile ? profile.profile : 1)} alt="profile" id="myProfile"/></div>
									<div className="col p-1 mx-0">
										<div className="row-4 my-1 p-2 h4" id="profileBorder">{profile?.nickname}</div>
										<div className="row-4 my-1 p-2 h4" id="profileBorder">{profile?.level}</div>
										<div className="row-4 my-1 p-2 h5" id="profileBorder">{profile?.win + profile?.lose}전 {profile?.win} 승 {profile?.lose}패</div>
									</div>
									<div className="col" id="modalTwofactor">
										<div className="row pt-2" id="modalTwofactorTitle">
											<div className="col h5 text-center">2중 인증</div>
											<div className="col-3 form-check form-switch">
												<input className="form-check-input" type="checkbox" onClick={handleQrcode}/>
											</div>
										</div>
										{ state && 
											<div className="text-center">
												<div className="row m-1" id="myProfileQrcode"><img src={qrcode === "" ?  Profile(1): qrcode} alt="qrcode"></img></div>
												<div className="row my-1 input-group">
												  <input type="number" className="col form-control" id="modalInput2fa" placeholder="ex)123456" maxLength={6} onChange={handleInput}/>
												  <button className="col btn modal-button px-0" type="button" onClick={handleSubmit}>확인</button>
												</div>
											</div>
										}
									</div>
								</div>
								<div className="row">
									<div className="col p-1 mx-1" id="myProfileNav">
										<nav>
											<div className="nav nav-tabs" id="myprofile-nav-tab" role="tablist">
												<button className="nav-link active" id="nav-friend-tab" data-bs-toggle="tab" data-bs-target="#nav-friend" type="button" role="tab" aria-controls="nav-friend" aria-selected="true">친구목록</button>
												<button className="nav-link" id="nav-block-tab" data-bs-toggle="tab" data-bs-target="#nav-block" type="button" role="tab" aria-controls="nav-block" aria-selected="false">차단목록</button>
											</div>
										</nav>
										<div className="tab-content border border-top-0" id="myprofile-nav-tabContent">
											<div className="tab-pane fade show active" id="nav-friend" role="tabpanel" aria-labelledby="nav-friend-tab">{friendList()}</div>
											<div className="tab-pane fade" id="nav-block" role="tabpanel" aria-labelledby="nav-block-tab">{blockList()}</div>
										</div>
									</div>
									<div className="col" id="myMatchHistory">
										<MatchHistory userid={profile?.userid} matchHistory={profile?.history}/>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="modal-footer">
						<button type="button" className="btn modal-button" data-dismiss="modal">닫기</button>
					</div>
				</div>
			</div>
		</div>
	);
}
