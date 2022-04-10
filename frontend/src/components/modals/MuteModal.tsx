import { useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { socket } from "../../socket/socket";
import { User } from "../../types/userTypes";
import { RootState } from "../../redux/rootReducer";
import Profile from "../../icons/Profile";
import "./MuteModal.css";

export default function MuteModal(props: any) {
	const thirtySeconds = useState<Array<string>>([]);
	const tenMinutes = useState<Array<string>>([]);
	const [checkedThirty, setCheckedThirty] = useState<boolean>(false);
	const [checkedTen, setCheckedTen] = useState<boolean>(false);
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);

	const handleSubmit = () => {
		console.log(tenMinutes[0]);
		tenMinutes[0]?.forEach((id: string) => {
			socket.emit("chatMute", {
				chatid: props.info.chatid,
				time: 600,
				userid: id,
			})
		}, (result: boolean) => { console.log(result); });
		console.log(thirtySeconds[0]);
		thirtySeconds[0]?.forEach((id: string) => {
			socket.emit("chatMute", {
				chatid: props.info.chatid,
				time: 30,
				userid: id,
			})
		}, (result: boolean) => { console.log(result); });
	}
	const handleThirtyBox = (id: string) => {
		if (checkedTen){
			const tenIdx: number = tenMinutes[0].indexOf(id);
			if (tenIdx !== -1) {tenMinutes[0].splice(tenIdx, 1);}
			setCheckedTen(false);
		}
		const idx:number = thirtySeconds[0].indexOf(id);
		if (idx === -1){
			thirtySeconds[0].push(id);	
		}else{
			thirtySeconds[0].splice(idx, 1);
		}
		setCheckedThirty(!checkedThirty);
	}
	const handleTenBox = (id: string) => {
		if (checkedThirty){
			const thirtyIdx: number = thirtySeconds[0].indexOf(id);
			if (thirtyIdx !== -1) {thirtySeconds[0].splice(thirtyIdx, 1);}
			setCheckedThirty(false);
		}
		const idx:number = tenMinutes[0].indexOf(id);
		if (idx === -1){
			tenMinutes[0].push(id);	
		}else{
			tenMinutes[0].splice(idx, 1);
		}
		setCheckedTen(!checkedTen);
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
			if (person.userid === user.userid) {
				return;
			}
			list.push(
				<div className="row" id="mutePerson" key={`mute_${person.userid}`}>
					<div className="col p-0" key={`mute_${person.userid}_img`}><img src={Profile(person.profile)} alt="profile" id="muteProfile" /></div>
					<div className="col" key={`mute_${person.userid}_nickname`}>{person.nickname}</div>
					<div className="col-2" key={`mute_${person.userid}_ten`}><input className="form-check-input" type="checkbox" value="10m" onClick={() => handleTenBox(person.userid)} checked={checkedTen}/></div>
					<div className="col-2" key={`mute_${person.userid}_thirty`}><input className="form-check-input" type="checkbox" value="30s" onClick={() => handleThirtyBox(person.userid)} checked={checkedThirty}/></div>
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
						<button type="button" className="btn modal-button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
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