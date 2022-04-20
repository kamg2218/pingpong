import {useState} from 'react';
import { socket } from '../../socket/socket';
import { NewGameRoomRequest } from '../../types/gameTypes';
import './Modals.css';

export default function AddGameRoomModal(){
	const [title, setTitle] = useState<string>('');
	const [radio, setRadio] = useState<string>('public');
	const [pwd, setPwd] = useState<string>('');
	const [observer, setObserber] = useState<number>(5);
	const [okBtn, setOkBtn] = useState<boolean>(false);
	const [speed, setSpeed] = useState<number>(1);

	const checkPwd = (pvalue:String):boolean => {
		if (pvalue.length !== 4)
			return false;
		for (let i = 0; i < 4; i++){
			if (isNaN(parseInt(pvalue.charAt(i))))
				return false;
		}
		return true;
	}
	const checkTitle = (tvalue:String):boolean => {
		if (tvalue[0] === '#'){ return false; }
		else if (tvalue === ''){ return false; }
		return true;
	}
	const handleTitle = (event:any) => { setTitle(event.target.value); handleOkBtn(event.target.value, pwd); }
	const handleRadio = (event:any) => { setRadio(event.target.value); }
	const handlePwd = (event:any) => { setPwd(event.target.value); handleOkBtn(title, event.target.value); }
	const handleObserver = (event:any) => { setObserber(event.target.value); }
	const handleSpeed = (event:any) => { setSpeed(event.target.value); }
	const handleOkBtn = (tvalue:String, pvalue:String) => {
		if (radio === 'private' && !checkPwd(pvalue)){setOkBtn(false);}
		else if (!checkTitle(tvalue)){setOkBtn(false);}
		else{setOkBtn(true);}
	}
	const handleSubmit = () => {
		let info:NewGameRoomRequest = { title: title, observer: observer, type: radio, speed: speed }
		if (radio === 'private'){ info.password = pwd; }
		socket.emit('createGameRoom', info);
	}
	return (
		<div className='modal fade' id='addGameRoomModal' role='dialog' tabIndex={-1} aria-labelledby='addGameRoomModalLabel' aria-hidden='true'>
			<div className='modal-dialog modal-dialog-centered' role='document'>
				<div className='modal-content'>
					<div className='modal-header'>
						<h5 id='addGameRoomLabel' className='modal-title'>방 만들기</h5>
						<button type='button' className='btn modal-button' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>
					</div>
					<div className='modal-body'>
						<div className='form-group'>
							<label className='col-form-label'>Title</label>
							<input type='text' className='form-control' onChange={handleTitle} required></input>
							<div className='form-group d-flex'>
								<div className='form-check form-check-inline'>
									<input className='form-check-input' type='radio' name='privateRadio' value='private' checked={radio === 'private'} onChange={handleRadio}></input>
									<label className='form-check-label mx-1'>Private</label>
								</div>
								<div className='form-check form-check-inline'>
									<input className='form-check-input' type='radio' name='publicRadio' value='public' checked={radio === 'public'} onChange={handleRadio}></input>
									<label className='form-check-label mx-1'>Public</label>
								</div>
							</div>
							<div id='password'>
								<label className='col-form-label'>Password</label>
								<input type='text' className='form-control' id='pwdInput' onChange={handlePwd} placeholder='ex)1234' maxLength={4} disabled={radio === 'public'} required={radio === 'private'}></input>
								<div className='invalid-feedback'>숫자 4자리</div>
							</div>
							<div id='selects' className='m-3'>
								<label className='col-form-label'>스피드</label>
								<select className='form-control-sm mx-3' onChange={handleSpeed}>
									<option value={1}>1</option>
									<option value={2}>2</option>
									<option value={3}>3</option>
								</select>
								<label className='col-form-label mx-2'>관전자 수</label>
								<select className='form-control-sm mx-1' defaultValue={5} onChange={handleObserver}>
									<option value={1}>1</option>
									<option value={2}>2</option>
									<option value={3}>3</option>
									<option value={4}>4</option>
									<option value={5}>5</option>
								</select>
							</div>
						</div>
					</div>
					<div className='modal-footer'>
						<button type='button' className='btn modal-button' data-dismiss='modal' disabled={!okBtn} onClick={handleSubmit}>확인</button>
						<button type='button' className='btn modal-button' data-dismiss='modal'>취소</button>
					</div>
				</div>
			</div>
		</div>
	);
}