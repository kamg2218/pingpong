export default function LoadingModal({content, handleCancelMatching}:{content:string, handleCancelMatching?:Function}){
	const contents:string = "잠시만 기다려 주세요";
	const state:string = contents === content ? "" : " d-none";
	
	const handleClick = () => {
		if (handleCancelMatching){ handleCancelMatching(); }
	}

	return (
		<div id="loadingModal">
			<div className="modal-body" onClick={handleClick}>
				<div className={`m-5 d-flex justify-content-center${state}`}>
					<div className="spinner-border" role="status">
						<span className="sr-only m-1"></span>
						Loading...
					</div>
					<div className="d-flex justify-content-center">{content}</div>
				</div>
			</div>
		</div>
	);
}