import { socket } from "../../socket/socket";
import { ChatUser } from "../../types/chatTypes";
import Profile from "../../icons/Profile";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { User } from "../../types/userTypes";

export default function ManagerModal(props:any){
	let managers:Array<string> = props.info.manager;
	let addManager:Array<string> = [];
	let deleteManager:Array<string> = [];
	// const success:string = "변경되었습니다";
	const failure:string = "다시 시도해주세요.";
	const user:User = useSelector((state:RootState)=>state.userReducer.user);

	// const setMembers = (member:Array<string>) => { managers = member; }
	const handleManager = () => {
		if (managers.length < 1){
			alert(failure);
			return ;
		}
		socket.emit("updateChatRoom", { 
			chatid: props.info.chatid,
			addManager: addManager,
			deleteManager: deleteManager
		}, (result:boolean)=>{ if (result !== true){ alert(failure); } });
	}
	const handleClick = (id:string) => {
		let idx:number = -1;
		if (checkManager(id)) {
			idx = deleteManager.findIndex((man:string)=>man === id);
			if (idx === -1){
				deleteManager.push(id);
			}else{
				deleteManager = deleteManager.filter((man:string)=>man !== id);
			}
		}else {
			idx = addManager.findIndex((man:string)=>man === id);
			if (idx === -1){
				addManager.push(id);
			} else {
				addManager = addManager.filter((man:string)=>man !== id);
			}
		}
	}
	const checkManager = (id:string) => {
		if (props.info.manager.findIndex((man:string)=>man === id) === -1){
			return false;
		}
		return true;
	}
	const MemberList = (member: ChatUser) => {
		if (member.userid === user.userid) return ;
		return (
			<li className="form-check" key={`memberList_${member.userid}`}>
				{/* checked={checkManager(member.userid)} */}
				<input className="form-check-input" type="checkbox" onClick={()=>handleClick(member.userid)} ></input>
				<img src={Profile(member.profile)} className="col-1 mx-1 rounded-cricle" alt="..."></img>
				<label className="form-check-label mx-1">{member.nickname}</label>
			</li>
		);
	}


	return (
		<div className="modal fade" id="managerModal" role="dialog" tabIndex={-1} aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 id="manager" className="modal-title" aria-hidden="true">매니저 추가</h5>
						<button type="button" className="btn modal-button" data-dismiss="modal">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div className="modal-body">
						<div className="rounded m-1" id="managerDiv">
							<ul key="memberList">
								{props.info.members.map((member:ChatUser)=>MemberList(member))}
							</ul>
						</div>
					</div>
					<div className="modal-footer">
						<button className="btn modal-button" data-dismiss="modal" onClick={handleManager}>확인</button>
						<button className="btn modal-button" data-dismiss="modal">취소</button>
					</div>
				</div>
			</div>
		</div>
	);
}