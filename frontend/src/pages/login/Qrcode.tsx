import { useState, useEffect } from 'react';
import { socket, user } from '../../socket/socket';
import img1 from '../../icons/profileImage1.png';

export default function Qrcode(){
    const [qrcode, setQrcode] = useState("");
    const [url, setUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [token, setToken] = useState("");
    
    function setData(qr:string, ur:string, se:string){
        setQrcode(qr);
        setUrl(ur);
        setSecret(se);
    }
    function makeCode(){
        socket.emit("qrcode", setData);
    }
    useEffect(()=>{
        if (qrcode === ''){
            console.log('code is doing...');
            makeCode();
            setTimeout(()=>setQrcode(""), 30000);
        }
    });

    function handleChange(event: any){
        setToken(event.target.value);
    }
    function handleSubmit(event : any){
        console.log(token);
        console.log(`code1 = ${token}`);
        // setCode(event.target.value.replace(/(\s*)/g, ""));
        console.log(`code2 = ${token}`);
        if (token.length !== 6){
            alert('QR 코드를 다시 확인해 주세요!');
        }else{
            console.log('code3 = ' + token);
        }
    }
    function handleKeypress(event: any){
        if (event.keyCode === 13){
            console.log('handle Key Press 13');
            handleSubmit(event);
        }
    }

    return (
        <div id='qrcode' className='d-flex flex-column justify-content-center m-5'>
            <div className='p-3'>
                <label>{secret}</label>
            </div>
            <div className='p-2'>
                <img alt='qrcodImg' src={qrcode !== '' ? qrcode : img1}></img>
            </div>
            <div className='p-2 d-flex'>
                <input placeholder='OTP Number without space.' onChange={handleChange} onKeyPress={handleKeypress}></input>
                <div className='btn btn-outline-dark m-1' onClick={handleSubmit}>Submit</div>
            </div>
        </div>
    );
}