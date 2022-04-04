export default function LoadingModal(props: any){
	const content:string = "잠시만 기다려 주세요";
	const state:string = props.content === content ? "" : " d-none";
	
	return (
		<div id="loadingModal">
			<div className="modal-body" onClick={props.handleCancelMatching}>
				<div className={`m-5 d-flex justify-content-center${state}`}>
					<div className="spinner-border" role="status">
						<span className="sr-only m-1"></span>
						Loading...
					</div>
					<div className="d-flex justify-content-center">{props.content}</div>
				</div>
			</div>
		</div>
	);
}