import { chatRoom } from "../../types/chatTypes";
import CheckModal from "../modals/CheckModal";
import InputPwdModal from "../modals/InputPwdModal";

export default function PublicChatList({chatroom, setPwd, checkRoom, handleSubmit}:{chatroom:chatRoom, setPwd:Function, checkRoom:Function, handleSubmit:Function}){
	const decidedModal = chatroom.lock ? "#inputPwdModal" : "#checkModal";

	return (
		<div key={`publicchat${chatroom.chatid}`} className="col-sm-5 col-4 m-2 p-2 modal-button">
			<button type="button" className="btn col-12" id="publicChatBtn" key={`publicchatBtn_${chatroom.chatid}`} data-toggle="modal" data-target={decidedModal} onClick={()=>{checkRoom(chatroom.chatid)}}>
				<div className="row" key={`publicchatBlock_${chatroom.chatid}`}>
					<div className="col-8 mx-2" key={`publicchatTitle_${chatroom.chatid}`}>{chatroom.title}</div>
					{chatroom.lock ? <i className="col-2 m-1 px-2 bi bi-key"/> : ""}
				</div>
				<div className="row m-2 px-1 justify-content-end" key={`publicchatMembers_${chatroom.chatid}`}>{chatroom.members.length} / {chatroom.max}</div>
			</button>
			<InputPwdModal id={chatroom.chatid} setPwd={setPwd} handleOk={handleSubmit}></InputPwdModal>
			<CheckModal content="입장하시겠습니까?" handleOk={handleSubmit}></CheckModal>
		</div>
	);
}