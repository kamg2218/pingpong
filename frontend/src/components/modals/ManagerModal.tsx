import { socket } from "../../socket/socket";
import { ChatUser } from "../../types/chatTypes";
import ManagerList from "./ManagerList";

export default function ManagerModal(props:any){
	let addManager:Array<string> = [];
	let deleteManager:Array<string> = [];
	const failure:string = "다시 시도해주세요.";

	const handleManager = () => {
		socket.emit("updateChatRoom", { 
			chatid: props.info.chatid,
			addManager: addManager,
			deleteManager: deleteManager
		}, (result:boolean)=>{ if (result !== true){ alert(failure); } });
	}
	const handleClick = (id:string, state:boolean) => {
		let idx:number = -1;
		if (state) {
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
	const MemberList = (member: ChatUser) => {
		if (member.userid === props.info.owner) return ;
		return <ManagerList info={props.info} member={member} handleClick={handleClick}></ManagerList>
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