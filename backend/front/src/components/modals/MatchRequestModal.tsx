import { useEffect, useState } from 'react';
import { socket } from '../../socket/socket';
import { match } from '../../types/gameTypes';

export default function MatchRequestModal({setIsOpen, matchData, namespace}:{setIsOpen:Function, matchData?:match, namespace:string}){
	const maxValue:number = 10;
	const [value, setValue] = useState<number>(0);
	
	const handleSubmit = (result:boolean) => {
		socket.emit(namespace, { requestid: matchData?.requestid, result: result });
		setIsOpen(false);
	};
	
	useEffect(()=>{
		if (value < maxValue){
			setTimeout(()=>setValue(value + 0.1), 100);
		} else { 
			socket.emit(namespace, { requestid: matchData?.requestid, result: false });
			setIsOpen(false);
		}
	}, [matchData?.requestid, namespace, setIsOpen, value]);
	
  return (
		<div id='matchRequestModal'>
			<div className='modal-header'>
				<h5 className='modal-title'>대전 신청</h5>
			</div>
			<div className='modal-body mx-3'>
				<h2>{matchData?.nickname}</h2>
				<div className='text-right mb-1'> 님이 대결을 신청했습니다.</div>
				<progress id='progressBar' value={value} max={maxValue} />
				<div className='row mt-2'>
					<div className='col btn modal-button mx-1' onClick={()=>handleSubmit(true)}>수락</div>
					<div className='col btn modal-button mx-1' onClick={()=>handleSubmit(false)}>거절</div>
				</div>
			</div>
		</div>
	);
}