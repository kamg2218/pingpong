import InputPwdModal from "./InputPwdModal";

export default function PublicChatList(props:any){
    const chatroom = props.chatroom;
    const decidedModal = chatroom.lock ? '#inputPwdModal' : '#checkModal';

    const handlePwd = (pwd: string) => {
        props.setPwd(pwd);
        props.checkRoom(chatroom.chatid);
    }
    return (
        <div key={`publicchat${props.chatroom.chatid}`} className="col-sm-5 col-4 m-2 p-2 rounded border">
            <button type="button" className='btn' data-toggle='modal' data-target={decidedModal}>
                <div className="row">
                    <div className="col-8 mx-2">{chatroom.title}</div>
                    {chatroom.lock ? <i className="col-2 m-1 px-2 bi bi-lock"/> : <i className="col-2 m-1 px-2 bi bi-unlock"/>}
                </div>
                <div className="row m-2 px-1 justify-content-end">{chatroom.members.length}/{chatroom.max}</div>
            </button>
            <InputPwdModal id={chatroom.chatid} setPwd={handlePwd}></InputPwdModal>
        </div>
    );
}