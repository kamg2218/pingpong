import { useEffect, useState } from "react";
import {useHistory} from "react-router-dom";
import { socket, ProfileUser } from "../../socket/userSocket";
import Profile from '../../icons/Profile'

export default function ProfileModal(props: any) {
	const history = useHistory();
	const [profile, setProfile] = useState<ProfileUser>();

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
						<div className="container-fluid row">
							<div className="col-5">
								<div className="row"><img src={Profile(profile ? profile.profile : 1)} className="row" alt="profile" id="profile"/></div>
								<div className="row w-75 my-1 btn btn-outline-dark" onClick={handleChat}> 1 : 1 채팅</div>
								<div className="row w-75 my-1 btn btn-outline-dark" onClick={handleMatch}>대전 신청</div>
							</div>
							<div className="col">
								<div className="row h2">{profile ? profile.nickname : "unknown"}</div>
								<div className="row">level</div>
								<div className="row">match history</div>
							</div>
						</div>
					</div>
					<div className="modal-footer">
						<button type="button" className="close btn btn-outline-dark" data-dismiss="modal">
							delete
						</button>
						<button type="button" className="close btn btn-outline-dark" data-dismiss="modal">
							block
						</button>
						<button type="button" className="close btn btn-outline-dark" data-dismiss="modal">
							닫기
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
