import { socket, User, UserContext } from "../../socket/userSocket";
import Profile from "../../icons/Profile";
import "./MuteModal.css";
import { useContext, useRef } from "react";

export default function MuteModal(props: any) {
	let thirtySeconds: Array<string> = [];
	let tenMinutes: Array<string> = [];
	const userContext = useContext(UserContext);
	const user: User = userContext.user[0];
	const checkBoxTen = useRef(null);
	const checkBoxThirty = useRef(null);

	const handleSubmit = () => {
		console.log(tenMinutes);
		tenMinutes?.forEach((id: string) => {
			socket.emit("chatMute", {
				chatid: props.info.chatid,
				time: 600,
				userid: id,
			})
		}, (result: boolean) => {
			console.log(result);
		});
		console.log(thirtySeconds);
		thirtySeconds?.forEach((id: string) => {
			socket.emit("chatMute", {
				chatid: props.info.chatid,
				time: 30,
				userid: id,
			})
		}, (result: boolean) => {
			console.log(result);
		});
	}
	const toggleList = (list: Array<string>, id: string) => {
		const idx: number = list.indexOf(id);
		if (idx === -1) {
			console.log(id);
			list.push(id);
		} else {
			list.slice(idx, 1);
		}
	}
	const handleCheckBox = (id: string, event:any) => {
		console.log(event.target);
		const value:string = event.target.value;
		if (value === "10m") {
			const thirtyIdx: number = thirtySeconds.indexOf(id);
			if (thirtyIdx !== -1){
				thirtySeconds.slice(thirtyIdx, 1);
				console.log(checkBoxThirty);
				// checkBoxThirty.checked = false;
			}
			toggleList(tenMinutes, id);
		} else {
			const tenIdx: number = tenMinutes.indexOf(id);
			if (tenIdx !== -1){
				tenMinutes.slice(tenIdx, 1);
				console.log(checkBoxTen);
			}
			toggleList(thirtySeconds, id);
		}
	}
	const muteListHeader = () => {
		return (
			<div className="row" id="muteListHeader" key="muteListHeader">
				<div className="col p-0" key="mute_profile">프로필</div>
				<div className="col" key="mute_nickname">닉네임</div>
				<div className="col-2" key="mute_ten">10분</div>
				<div className="col-2" key="mute_thirty">30초</div>
			</div>
		);
	}
	const muteList = (info: Array<User>) => {
		let list: JSX.Element[] = [];

		list.push(muteListHeader());
		info.forEach((person: User) => {
			if (person.userid === user?.userid) {
				return;
			}
			list.push(
				<div className="row" id="mutePerson" key={`mute_${person.userid}`}>
					<div className="col p-0" key={`mute_${person.userid}_img`}><img src={Profile(person.profile)} alt="profile" id="muteProfile" /></div>
					<div className="col" key={`mute_${person.userid}_nickname`}>{person.nickname}</div>
					<div className="col-2" key={`mute_${person.userid}_ten`}><input className="form-check-input" type="checkbox" value="10m" onClick={(e) => handleCheckBox(person.userid, e)} ref={checkBoxTen} /></div>
					<div className="col-2" key={`mute_${person.userid}_thirty`}><input className="form-check-input" type="checkbox" value="30s" onClick={(e) => handleCheckBox(person.userid, e)} ref={checkBoxThirty}/></div>
				</div>
			);
		});
		return list;
	}
	return (
		<div className="modal fade" id="muteModal" role="dialog" tabIndex={-1} aria-labelledby="MuteModalLabel" aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 id="MuteModalLabel" className="modal-title">음소거</h5>
						<button type="button" className="btn modal-button" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div className="modal-body">
						<div className="container col" id="muteList">{props.info && muteList(props.info.members)}</div>
					</div>
					<div className="modal-footer">
						<button type="button" className="btn modal-button" data-dismiss="modal" onClick={handleSubmit}>확인</button>
						<button type="button" className="btn modal-button " data-dismiss="modal" aria-label="Close">취소</button>
					</div>
				</div>
			</div>
		</div>
	);
}