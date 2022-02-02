import { useContext, useEffect, useState } from "react";
import {useHistory} from "react-router-dom";
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
		const url:string = "http://localhost:4242/2fa/authenticate";
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
			axios.post(url + "/turn-on").then((res:any)=>{
				console.log(res.data);
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
				<div className="row text-center align-items-center" id="friendContent" onClick={()=>handleClick(friend.userid)}>
					<div className="col m-0"><img src={Profile(friend.profile)} alt="profile" id="friendProfile"/></div>
					<div className="col">{friend.nickname}</div>
					<div className="col Mark"><i className="bi bi-check-lg" onClick={()=>acceptNewFriend(friend.userid)}/></div>
					<div className="col Mark"><i className="bi bi-x-lg" id="crossMark" onClick={()=>declineNewFriend(friend.userid)}/></div>
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
						<button type="button" className="close btn btn-outline-dark" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div className="modal-body">
						<div className="container p-1">
							<div className="col">
								<div className="row mb-2">
									<div className="col justify-content-center"><img src={Profile(profile ? profile.profile : 1)} alt="profile" id="myProfile"/></div>
									<div className="col">
										<div className="row mx-2 h4">{profile?.nickname}</div>
										<div className="row mx-2 h4">{profile?.level}</div>
										<div className="row mx-2 h5">{profile?.win + profile?.lose}전 {profile?.win} 승 {profile?.lose}패</div>
									</div>
									<div className="col">
										<div className="row">
											<div className="h5">2중 인증</div>
											<div className="form-check form-switch">
												<input className="form-check-input" type="checkbox" onClick={handleQrcode}/>
											</div>
										</div>
										{ state && 
											<div className="text-center">
												<div className="row border" id="qrcode"><img src={qrcode} alt="qrcode"></img></div>
												<div className="row input-group mb-3">
												  <input type="number" className="col form-control" placeholder="ex)1234" maxLength={4} onChange={handleInput}/>
												  <button className="col btn btn-outline-secondary" type="button" onClick={handleSubmit}>확인</button>
												</div>
											</div>
										}
									</div>
								</div>
								<div className="row">
									<div className="col" id="myProfileNav">
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
									<div className="col" id="historyColumn">
										<MatchHistory userid={profile?.userid} matchHistory={profile?.history}/>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="modal-footer">
						<button type="button" className="close btn btn-outline-dark" data-dismiss="modal">
							닫기
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
