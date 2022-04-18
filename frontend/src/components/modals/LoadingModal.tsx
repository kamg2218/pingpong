export default function LoadingModal({content, handleCancelMatching}:{content:string, handleCancelMatching?:Function}){
	const handleClick = () => {
		if (handleCancelMatching){ handleCancelMatching(); }
	}

	return (
		<div className='modal-body' onClick={handleClick}>
			<div className='m-5' id='loadingModal'>
				<div className='spinner-border' role='status'>
					<span className='m-2'>Loading...</span>
				</div>
			</div>
			<div className='mx-5'>{content}</div>
		</div>
	);
}