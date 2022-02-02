import { useEffect, useState } from "react";
import {useHistory} from "react-router-dom";
import { socket, ProfileUser } from "../../socket/userSocket";
import Profile from '../../icons/Profile'
import MatchHistory from "../games/MatchHistory";
import "./profileModal.css"

export default function ProfileModal(props: any) {
	const history = useHistory();
	const [profile, setProfile] = useState<ProfileUser>();
	const button:string = "row w-75 my-1 btn btn-outline-dark";
	let buttonFriend:string = button;

	useEffect(() => {
		if (!profile) {
			socket.emit("opponentProfile", {
				userid: props.userid,
			});
		}
		socket.on("opponentProfile", (data) => {
			setProfile(data);
		});
	}, [profile, props.userid]);
	
	const handleChat = () => {
		socket.emit("createChatRoom", {
			type: "private",
			member: [profile?.userid]
		}, (chatid: string)=>{
			if (chatid !== ''){
				history.push(`/game/chat/${chatid}`);
				//or
				// history.push(`/game/chat/${chatid}/waiting/:id`);
			}
		})
	}
	const handleMatch = () => {
		socket.emit("matchRequest", {
			userid: profile?.userid
		})
	}
	const handleFriend = () => {
		if (profile?.friend){
			socket.emit("deleteFriend", {
				userid: profile.userid
			})
			buttonFriend = button;			
		}else{
			socket.emit("addFriend", {
				userid: profile?.userid
			})
			buttonFriend = button + " disabled";
		}
	}
	const handleBlock = () => {
		if (profile?.block){
			socket.emit("unblockFriend", {
				userid: profile.userid
			})
		}else {
			socket.emit("blockFriend", {
				userid: profile?.userid
			})
		}
		socket.emit("opponentProfile", {
			userid: props.userid,
		});
	}
	return (
		<div className="modal fade" id="ProfileModal" role="dialog" tabIndex={-1} aria-labelledby="ProfileModalLabel" aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 id="addGameRoomLabel" className="modal-title">상대 프로필</h5>
						<button type="button" className="close btn btn-outline-dark" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div className="modal-body">
						<div className="container p-1">
							<div className="row text-center">
								<div className="col-4">
									<div className="row mb-2 justify-content-center"><img src={Profile(profile ? profile.profile : 1)} alt="profile" id="profile"/></div>
									<div className={button} onClick={handleChat} data-dismiss="modal"> 1 : 1 채팅</div>
									<div className={button} onClick={handleMatch}>대전 신청</div>
									<div className={buttonFriend} onClick={handleFriend}>{profile?.friend ? "친구 삭제" : "친구 추가"}</div>
									<div className={button} onClick={handleBlock}>{profile?.block ? "차단 해제" : "차단"}</div>
								</div>
								<div className="col">
									<div className="row h4"><div className="border bg-warning rounded py-1">{profile ? profile.nickname : "unknown"}</div></div>
									<div className="row h4 my-2"><div className="border bg-warning rounded py-1">{profile ? profile.level : "primary"}</div></div>
									<div className="row mt-3 pt-1 matchHistory">
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