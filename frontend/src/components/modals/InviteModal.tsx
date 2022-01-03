import InviteList from '../chat/InviteList';
import {socket} from '../../socket/userSocket';

export default function InviteModal(props:any){
    let members:Array<string> = [];
    const success:string = "초대되었습니다!";
    const failure:string = "다시 시도해주세요.";

    function setMembers(member:Array<string>){
        members = member;
    }
    function handleInvite(){
        if (members.length < 1){
            alert(failure);
            return ;
        }
        socket.emit('inviteChatRoom', {
            chatid: props.info.chatid,
            user: members,
        }, (result:boolean)=>{
            if (result === true)
                alert(success);
            else
                alert(failure);
        });
    }
    return (
        <div className='modal fade' id='InviteModal' role='dialog' tabIndex={-1} aria-labelledby='invite' aria-hidden="true">
            <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable' role='document'>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 id='invite' className="modal-title" aria-hidden='true'>친구 초대</h5>
                        <button type='button' className='close btn' data-dismiss='modal'>
                            <span aria-hidden='true'>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="border rounded m-1" id="inviteDiv">
                            <InviteList setMembers={setMembers}></InviteList>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-outline-dark" data-dismiss="modal" onClick={handleInvite}>초대하기</button>
                        <button className="btn btn-outline-secondary" data-dismiss="modal">취소</button>
                    </div>
                </div>
            </div>
        </div>
    );
}