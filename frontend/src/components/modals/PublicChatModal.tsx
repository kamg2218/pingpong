import {useEffect, useState} from 'react'
import {socket} from '../../socket/userSocket'
import {ChatData, publicchatroom} from '../../socket/chatSocket'
import PublicChatList from './PublicChatList'

export default function PublicChatModal(){
    const [pwd, setPwd] = useState<String>('');
    const [checkedroom, checkRoom] = useState<String>('');
    const [publicChat, setPublicChat] = useState<ChatData>(publicchatroom);

    useEffect(() => {
        socket.emit("publicChatRoom");
        setPublicChat(publicchatroom);
        console.log(publicChat);
    }, [publicChat]);
    function handleSubmit(){
        let data:any = {};

        data.chatid = checkedroom;
        if (pwd)
            data.password = pwd;
        socket.emit("enterChatRoom", data
        // , (result: boolean)=>{
        //     if (result === true)
        //         console.log("초대되었습니다.");
        //     else
        //         console.log("try again!");}
        );
    }

    return (
        <div className="modal fade h-8" id="PublicChatModal" role="dialog" tabIndex={-1} aria-labelledby="PublicChatModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                    	<h5 id="PublicChatModalLabel" className="modal-title">공개 채팅방</h5>
                    	<button type="button" className="close btn btn-outline-dark" data-dismiss="modal" aria-label="Close">
                	    	<span aria-hidden="true">&times;</span>
                    	</button>
                    </div>
                    <div className="modal-body">
                        <div className="container p-0">
                            <div className="row overflow-scroll justify-content-center">
                                {publicchatroom?.chatroom.map(room=> <PublicChatList chatroom={room} setPwd={setPwd} checkRoom={checkRoom}/>)}
                            </div>
                        </div>
					</div>
                    <div className="modal-footer">
                        <button type="button" className="close btn btn-outline-dark" data-dismiss="modal" onClick={handleSubmit}>확인</button>
                        <button type="button" className="close btn btn-outline-secondary" data-dismiss="modal">취소</button>
                    </div>
                </div>
            </div>
        </div>
    );
}