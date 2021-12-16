import {useState} from 'react';
import {socket} from '../../socket/userSocket';

export default function PwdModal(props: any){
	const [pwd, setPwd] = useState('');
	const success:string = "비밀번호가 변경되었습니다.";
	const failure:string = "비밀번호를 확인해주세요!!";

    const handlePwd = (e :any) => {
		setPwd(e.target.value);
	}
	const handlePwdOK = ()=>{
		if (pwd === '' || pwd.length !== 4){
			alert(failure);
			return ;
		}
		for (let i = 0; i < pwd.length; i++){
			const num = parseInt(pwd[i]);
			if (isNaN(num)){
				alert(failure);
				return ;
			}
		}
		socket.emit('updateChatRoom', {
			chatid: props.info.chatid,
			password: pwd,
		}, (result:boolean)=>{
			if (result === true)
				alert(success);
			else
				alert(failure);
		});
	}
    return (
        <div className="modal fade" id="pwdModal" role="dialog" tabIndex={0} aria-labelledby="pwdModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-sm" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                    	<h5 id="pwdModalLabel" className="modal-title">비밀번호 변경</h5>
                    	<button type="button" className="close btn btn-outline-dark" data-dismiss="modal" aria-label="Close">
                	    	<span aria-hidden="true">&times;</span>
                    	</button>
                    </div>
                    <div className="modal-body">
						<div className="input-group p-2">
							<input className="form-control" type="password" placeholder='ex)1234' onChange={handlePwd}></input>
							<button className='btn btn-outline-secondary' onClick={handlePwdOK}>확인</button>
						</div>
					</div>
                </div>
            </div>
        </div>
    );
}