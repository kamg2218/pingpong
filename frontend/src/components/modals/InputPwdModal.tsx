import {useState} from 'react';
import './Modals.css';

export default function InputPwdModal({setPwd, handleOk}:{setPwd:Function, handleOk?:Function}){
	const [pwd, setInputPwd] = useState<String>('');
	const failure:string = '비밀번호를 확인해주세요!!';

	const handlePwd = (e :any) => {
		setInputPwd(e.target.value);
		setPwd(e.target.value);
	}
	const handlePwdOK = ()=>{
		if (pwd === '' || pwd.length !== 4){
			alert(failure);
			return ;
		}
		for (let i = 0; i < pwd.length; i++){
			const num = parseInt(pwd[i]);
			if (isNaN(num)){
				alert(failure);
				return ;
			}
		}
		if (handleOk){ handleOk(); }
	}

	return (
		<div className='modal fade' id='inputPwdModal' role='dialog' tabIndex={-1} aria-labelledby='inputPwdModalLabel' aria-hidden='true'>
			<div className='modal-dialog modal-dialog-centered modal-sm' role='document'>
				<div className='modal-content'>
					<div className='modal-header'>
						<h5 id='inputPwdModalLabel' className='modal-title'>비밀번호 확인</h5>
						<button type='button' className='btn modal-button' data-dismiss='modal' aria-label='Close'>
							<span aria-hidden='true'>&times;</span>
						</button>
					</div>
					<div className='modal-body'>
						<div className='input-group p-2'>
							<input className='d-none' type='password'/>
							<input className='form-control' type='password' placeholder='ex)1234' onChange={handlePwd}></input>
							<button className='btn modal-button' data-dismiss='modal' onClick={handlePwdOK}>확인</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}