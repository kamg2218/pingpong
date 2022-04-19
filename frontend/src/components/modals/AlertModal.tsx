export default function AlertModal({content}:{content:string}){
	return (
		<div className='modal fade' id='alertModal' role='dialog' tabIndex={-1} aria-labelledby='AlertModalLabel' aria-hidden='true'>
			<div className='modal-dialog modal-dialog-centered modal-sm' role='document'>
				<div className='modal-content'>
					<div className='modal-header'>
						<h5 id='AlertModalLabel' className='modal-title'>알림</h5>
						<button type='button' className='btn modal-button' data-dismiss='modal' aria-label='Close'>
							<span aria-hidden='true'>&times;</span>
						</button>
					</div>
					<div className='modal-body'>
						<div>{content}</div>
					</div>
					<div className='modal-footer'>
						<button type='button' className='btn modal-button' data-dismiss='modal' aria-label='Close'>확인</button>
					</div>
				</div>
			</div>
		</div>
	);
}