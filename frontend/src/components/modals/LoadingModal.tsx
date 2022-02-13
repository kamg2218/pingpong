export default function LoadingModal(props: any){
	const content:string = "잠시만 기다려 주세요";
	const state:string = props.content === content ? "" : " d-none";
	
	return (
		<div className="modal fade" id="LoadingModal" role="dialog" tabIndex={-1} aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered modal-sm" role="document">
				<div className="modal-content">
					<div className="modal-body">
						<div className={`m-5 d-flex justify-content-center${state}`}>
							<div className="spinner-border" role="status">
								<span className="sr-only m-1"></span>
								Loading...
							</div>
						</div>
						<div className="d-flex justify-content-center">{props.content}</div>
					</div>
				</div>
			</div>
		</div>
	);
}