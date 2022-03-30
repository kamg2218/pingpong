import { useEffect, useState } from "react";
import {useHistory} from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
import { gameRoom } from "../../types/gameTypes";
import { ProfileUser, User } from "../../types/userTypes";
import { RootState } from "../../redux/rootReducer";
import MatchHistory from "../games/MatchHistory";
import Profile from '../../icons/Profile'
import "./profileModal.css"

export default function ProfileModal(props: any) {
	const history = useHistory();
	const userid:string = props.userid;
	const [profile, setProfile] = useState<ProfileUser>();
	const button:string = "row w-75 my-1 btn modal-button";
	const user:User = useSelector((state:RootState)=>state.userReducer.user, shallowEqual);
	const gameroom:gameRoom = useSelector((state:RootState) => state.gameReducer.gameroom, shallowEqual);
	let buttonFriend:string = button;

	useEffect(() => {
		if (userid && !profile) {
			console.log("opponent Profile");
			socket.emit("opponentProfile", { userid: userid });
		}
		socket.on("opponentProfile", (data:ProfileUser) => {
			console.log(`opponent = `, data);
			setProfile(data);
		});
	}, [profile, userid]);
	
	const handleChat = () => {
		if (userid === user.userid){
			return ;
		}
		socket.emit("createChatRoom", {
			type: "private",
			member: [userid]
		}, (chatid: string)=>{
			console.log(chatid);
			if (chatid !== ''){
				history.push(`/game/chat/${chatid}${gameroom ? `/waiting/${gameroom.roomid}`: ''}`);
			}
		})
	}
	const handleMatch = () => {
		if (userid === user.userid){
			return ;
		}
		socket.emit("matchRequest", { userid: profile?.userid });
	}
	const handleFriend = () => {
		if (userid === user.userid){
			return ;
		}
		if (profile?.friend){
			socket.emit("deleteFriend", { userid: profile.userid })
			buttonFriend = button;
		}else{
			socket.emit("addFriend", { userid: profile?.userid })
			buttonFriend = button + " disabled";
		}
	}
	const handleBlock = () => {
		if (userid === user.userid){
			return ;
		}
		if (profile?.block){ socket.emit("unblockFriend", { userid: profile.userid }) }
		else { socket.emit("blockFriend", { userid: profile?.userid }) }
		socket.emit("opponentProfile", { userid: props.userid });
	}
	return (
		<div className="modal fade" id="profileModal" role="dialog" tabIndex={-1} aria-labelledby="ProfileModalLabel" aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 id="addGameRoomLabel" className="modal-title">상대 프로필</h5>
						<button type="button" className="btn modal-button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					</div>
					<div className="modal-body">
						<div className="container p-1">
							<div className="row text-center">
								<div className="col-4">
									<div className="row mb-2 p-0 justify-content-center"><img src={Profile(profile ? profile.profile : 0)} alt="profile" id="modalProfile"/></div>
									<div className={button} onClick={handleChat} data-dismiss="modal"> 1 : 1 채팅</div>
									<div className={button} onClick={handleMatch} data-dismiss="modal" data-toggle="modal" data-target="#loadingModal">대전 신청</div>
									<div className={buttonFriend} onClick={handleFriend} data-dismiss="modal">{profile?.friend ? "친구 삭제" : "친구 추가"}</div>
									<div className={button} onClick={handleBlock} data-dismiss="modal">{profile?.block ? "차단 해제" : "차단"}</div>
								</div>
								<div className="col">
									<div className="row h4"><div className="py-1" id="profileNickname">{profile ? profile.nickname : "unknown"}</div></div>
									<div className="row h4 my-2"><div className="py-1" id="profileLevel">{profile ? profile.level : "primary"}</div></div>
									<div className="row mt-3 pt-1" id="matchHistory"><MatchHistory userid={profile?.userid} matchHistory={profile?.history}/></div>
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
