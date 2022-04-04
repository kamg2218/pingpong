import { useState } from "react";
import { socket } from "../../socket/socket";

export default function TitleInput(props :any){
	const [title, setTitle] = useState(props.info.title);

	const handleTitleChange = (e :any) => { setTitle(e.target.value); }
	const handleTitleClick = () => {
		socket.emit("updateChatRoom", {
			chatid: props.info.chatid,
			title: title
		}, (result:boolean)=>{ console.log(result); });
		props.changeTitle();
	}
	const handleKeyPress = (e :any) => {
		if (e.key === "Enter"){ handleTitleClick(); }
	}

	return (
		<div key={`titleInput_${props.info.chatid}`} className="d-flex" id="titleInput">
			<input className="d-none" type="password"/>
			<input className="col-10" id="titleInputBox" key={`titleInputBox_${props.info.chatid}`} value={title} placeholder={title} onChange={e => handleTitleChange(e)} onKeyPress={e=>handleKeyPress(e)}></input>
			<button className="col btn p-1" id="titleInputSubmit" key={`titleInputSubmit_${props.info.chatid}`} onClick={handleTitleClick}>OK</button>
		</div>
	);
}