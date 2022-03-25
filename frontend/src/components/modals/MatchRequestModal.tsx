import { useEffect, useState } from "react";
import { socket } from "../../context/userContext";

export default function MatchRequestModal(props:any){
	const maxValue:number = 10;
	const [value, setValue] = useState<number>(0);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleSubmit = (result:boolean) => {
    socket.emit("matchResponse", {
    	requestid: props.matchData?.requestid,
    	result: result
		});
		props.setIsOpen(false);
	};
	
	useEffect(()=>{
		if (value < maxValue){
			setTimeout(()=>setValue(value + 0.1), 100);
		}else{
			handleSubmit(false);
		}
	}, [handleSubmit, value]);
	
  return (
		<div id="matchRequestModal">
			<div className="modal-header">
				<h5 className="modal-title">대전 신청</h5>
			</div>
			<div className="modal-body mx-3">
				<h2>{props.matchData?.nickname}</h2>
				<div className="text-right mb-1"> 님이 대결을 신청했습니다.</div>
				<progress id="progressBar" value={value} max={maxValue} />
				<div className="row mt-2">
					<div className="col btn modal-button mx-1" onClick={()=>handleSubmit(true)}>수락</div>
					<div className="col btn modal-button mx-1" onClick={()=>handleSubmit(false)}>거절</div>
				</div>
			</div>
		</div>
	);
}