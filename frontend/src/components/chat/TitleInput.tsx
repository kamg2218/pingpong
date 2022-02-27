import { useState } from "react";
import { socket } from "../../socket/userSocket";

export default function TitleInput(props :any){
	const [title, setTitle] = useState(props.info.title);

	const handleTitleChange = (e :any) => {
		setTitle(e.target.value);
	}
	const handleTitleClick = () => {
		socket.emit("updateChatRoom", {
			chatid: props.info.chatid,
			title: title,
		}, (result:boolean)=>{
			console.log(result);
		});
		props.changeTitle();
		window.location.reload();
	}
	const handleKeyPress = (e :any) => {
		if (e.key === "Enter"){
			handleTitleClick();
		}
	}

	return (
		<div key={`titleInput_${props.info.chatid}`} className="d-flex" id="titleInput">
			<input className="col-10" id="titleInputBox" value={title} placeholder={title} onChange={e => handleTitleChange(e)} onKeyPress={e=>handleKeyPress(e)}></input>
			<button className="col btn p-1" id="titleInputSubmit" onClick={handleTitleClick}>OK</button>
		</div>
	);
}