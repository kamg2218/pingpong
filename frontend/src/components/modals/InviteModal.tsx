import {socket, user, Friend} from '../../socket/userSocket';

export default function InviteModal(props:any){
    let list:Array<string> = [];
    const success:string = "초대되었습니다!";
    const failure:string = "다시 시도해주세요.";

    function checkbox(data:Friend){
        const handleClick = (data:Friend) => {
            if (list.find(idx=> idx === data.userid))
                list.filter(idx=> idx !== data.userid);
            else
                list.push(data.userid);
        }
        return (
            <li className='form-check m-2' key={data.userid}>
                <input className='form-check-input' type='checkbox' value='' onClick={()=>handleClick(data)}></input>
                <label className='form-check-label m-1'>{data.nickname}</label>
            </li>
        );
    }
    function handleInvite(){
        socket.emit('inviteChatRoom', {
            chatid: props.info.chatid,
            user: list,
        }, (result:boolean)=>{
            if (result === true)
                alert(success);
            else
                alert(failure);
        });
    }
    return (
        <div className='modal fade' id='inviteModal' role='dialog' tabIndex={-1} aria-labelledby='invite' aria-hidden="true">
            <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable' role='document'>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 id='invite' className="modal-title" aria-hidden='true'>친구 초대</h5>
                        <button type='button' className='close btn' data-dismiss='modal'>
                            <span aria-hidden='true'>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <ul key='inviteBox'>
                            {user.friends.map(friend=>checkbox(friend))}
                        </ul>
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