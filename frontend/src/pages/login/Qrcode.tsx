import { useState, useEffect } from 'react';
import { socket } from '../../socket/userSocket';
import img1 from '../../icons/profileImage1.png';
import { resolve } from 'dns';

export default function Qrcode(){
    const [qrcode, setQrcode] = useState("");
    const [url, setUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [token, setToken] = useState("");
    const [verified, setVerified] = useState(false);
    
    useEffect(()=>{
        if (qrcode === ''){
            console.log('code is doing...');
            makeCode();
            // setTimeout(()=>setQrcode(""), 300000);
        }
    });
    function setData(qr:string, ur:string, se:string){
        setQrcode(qr);
        setUrl(ur);
        setSecret(se);
    }
    function makeCode(){
        socket.emit("qrcode", setData);
    }
    function checkToken():boolean {
        if (token.length !== 6)
            return false;
        for (let i = 0; i < token.length; i++){
            const num = parseInt(token[i]);
            // console.log(`num = ${num}`);
            if (isNaN(num))
                return false;
        }
        return true;
    }
    function handleChange(event: any){
        setToken(event.target.value);
    }
    function alertResult(result: boolean){
        console.log('alert result! ' + verified);
        if (result === true){
            alert("it's true!");
        }else{
            alert("it's false~");
        }
    }
    function handleVerified(result: boolean){
            console.log('handle verify! ' + result);
            setVerified(result);
    }
    function handleSubmit(event : any){
        console.log(token);
        if (token.length !== 6 || !checkToken()){
            alert('QR 코드를 다시 확인해 주세요!');
        }else{
            socket.emit("verifiedcode", { 'token': token }, async (result :boolean)=>{
                handleVerified(result);
                alertResult(result);
            });
        }
    }
    function handleKeypress(event: any){
        if (event.code === 'Enter'){
            handleSubmit(event);
        }
    }

    return (
        <div id='qrcode' className='d-flex flex-column justify-content-center m-5'>
            <div className='p-2'>
                <img alt='qrcodImg' src={qrcode !== '' ? qrcode : img1}></img>
                <div className='p-2 d-flex'>
                    <input placeholder='OTP Number without space.' onChange={handleChange} onKeyPress={handleKeypress}></input>
                    <div className='btn btn-outline-dark m-1' onClick={handleSubmit}>Submit</div>
                </div>
            </div>
        </div>
    );
}