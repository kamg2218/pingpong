import 'bootstrap/dist/js/bootstrap';

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
	//change chatroom title
	const handleTitle = () => {
		props.getTitle(props.info.idx, '#' + props.info.title);
	}
	//change password
	const handlePwd = () => {

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
					<button className='btn' key='title' onClick={() => handleTitle()}>title</button>
				</li>
				<li className='dropdown-item' key='pwd'>
					<button className='btn' onClick={() => handlePwd()}>password</button>
				</li>
				<li className='dropdown-item' key='invite'>
					<button className='btn' data-toggle='modal' data-target='#friendList'>invite</button>
				</li>
				<li className='dropdown-item' key='exit'>
		        	<button className='btn' onClick={() => handleExit()}>exit</button>
				</li>
				
				<div className='modal fade' id='friendList' role='dialog' aria-labelledby='friendList'>
					<div className='modal-dialog' role='document'>
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Invite Friends</h5>
								<button type='button' className='close' data-dismiss='modal'>
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div className="modal-body">
								<div id='friendList' className='scroll-box m-2'>
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