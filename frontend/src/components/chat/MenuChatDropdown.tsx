import 'bootstrap/dist/js/bootstrap';
import { useState } from 'react';
import { user } from '../../socket/socket';

export default function MenuChatDropdown(props :any){
	//invite friends to chatroom
	// const handleInvite = () => {
	// 	return (
	// 		<div className='modal-dialog' role='document'>
	// 			<div className="modal-content">
	// 				<div className="modal-header">
	// 					<h5 className="modal-title">Invite Friends</h5>
	// 					<button type='button' className='close' data-dismiss='modal'>
	// 						<span aria-hidden="true">&times;</span>
	// 					</button>
	// 				</div>
	// 				<div className="modal-body">
	// 					<div id='friendList' className='scroll-box m-2'>
	// 					</div>
	// 				</div>
	// 				<div className="modal-footer">
	// 					<button className="btn btn-primary">Invite</button>
	// 			        <button className="btn btn-secondary" data-dismiss="modal">Close</button>
	// 				</div>
	// 			</div>
	// 		</div>
	// 	);
	// }
	const [pwd, setPwd] = useState('');
	
	//change chatroom title
	const handleTitle = () => {
		props.setTitle(props.info.idx, '#' + props.info.title);
		props.setState('#' + props.info.title);
	}
	//change password
	const handlePwd = (e :any) => {
		setPwd(e.target.value);
	}
	const handlePwdOK = ()=>{
		for (let i = 0; i < pwd.length; i++){
			const num = parseInt(pwd[i]);
			if (isNaN(num))
				alert('비밀번호를 확인해주세요!!');
		}
		//socket.emit('');
		alert('비밀번호가 변경되었습니다.');
	}
	//exit the chatroom
	const handleExit = () => {
	}

    return (
        <div id={props.info.idx} className="dropdown">
	        <button className="btn float-end" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="bi bi-three-dots-vertical"></i>
	        </button>
	        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
				<li className='dropdown-item' key='title'>
					<button className='btn' key='title' onClick={()=>handleTitle()} disabled={props.info.owner !== user.id}>title</button>
				</li>
				<li className='dropdown-item' key='pwd'>
					<button type='button' className='btn' data-toggle='modal' data-target='#pwdModal'>password</button>
					{/* password */}
					<div className="modal fade" id="pwdModal" role="dialog" aria-labelledby="pwdModalLabel" aria-hidden="true">
                    	<div className="modal-dialog modal-dialog-centered modal-sm" role="document">
                        	<div className="modal-content">
                            	<div className="modal-header">
                                	<h5 className="modal-title" id="pwdModalLabel">비밀번호 변경</h5>
                                	<button type="button" className="close btn btn-outline-dark" data-dismiss="modal" aria-label="Close">
                                	    <span aria-hidden="true">&times;</span>
                                	</button>
                            	</div>
                            	<div className="modal-body">
									hello new modal
									{/* <input placeholder='ex)1234' onChange={handlePwd}></input> */}
									{/* <button onClick={handlePwdOK}>OK</button> */}
								</div>
                            	<div className="modal-footer">
                            	    <button type="button" className="btn btn-outline-dark" data-dismiss="modal">OK</button>
									<button type="button" className="close btn btn-outline-dark" data-dismiss="modal">Cancel</button>
									{/* <button type="button" className="btn btn-outline-dark" data-dismiss="modal">Cancel</button> */}
                            	</div>
                        	</div>
                    	</div>
                	</div>
				</li>
				<li className='dropdown-item' key='invite'>
					<button className='btn' data-toggle='modal' data-target='#friendListModal'>invite</button>
				</li>
				<li className='dropdown-item' key='exit'>
		        	<button className='btn' onClick={() => handleExit()}>exit</button>
				</li>
				{/* friendList */}
				<div className='modal fade' id='friendListModal' role='dialog' aria-labelledby='friendList' aria-hidden="true">
					<div className='modal-dialog' role='document'>
						<div className="modal-content">
							<div className="modal-header">
								<h5 id='friendList' className="modal-title">Invite Friends</h5>
								<button type='button' className='close' data-dismiss='modal'>
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div className="modal-body">
								<div className='scroll-box m-2'>
									invite
								</div>
							</div>
							<div className="modal-footer">
								<button className="btn btn-primary">Invite</button>
				        		<button className="btn btn-secondary" data-dismiss="modal">Close</button>
							</div>
						</div>
					</div>					
				</div>
	        </ul>
	    </div>
    );
}