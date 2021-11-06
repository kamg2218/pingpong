import axios from 'axios';
import { useState } from 'react';
import './Nick.css';
import Profile from "./ProfileCarousel";

const url = 'http://localhost:4242';

export default function Nick(){
    const [profile, setProfile] = useState<number>(0);
    const [nickname, setNickname] = useState<String>("");

    function handleCheck(event : any){
        event.preventDefault();
        console.log(nickname);
        console.log(profile);
        axios.get(`${url}/auth/check?nickname=${nickname}`)
        .then(res=>{console.log(res)})
        .catch(error=>{console.log(error)});
    }
    function handleOK(event: any){
        event.preventDefault();
        axios.post(`${url}/auth/signup`, {
            "nickname": nickname,
            "profile": profile
        }
        ).then(res=>{console.log(res)})
        .catch(err=>{console.error(err)});
    }
    function handleCancel(event: any){
        event.preventDefault();
        window.location.href = '/';
    }

    return (
        <form className="col-sm-8 col-md-5">
            <Profile profile={profile} setProfile={setProfile}></Profile>
            <div className="nick">
                <input placeholder="nickname" onChange={(event)=>setNickname(event.target.value)}/>
                <button className="btn btn-outline-dark m-1" onClick={handleCheck}>Check</button>
            </div>
            <div>
                <button className="btn btn-outline-dark m-1" type="submit" onClick={handleOK}>OK</button>
                <button className="btn btn-outline-dark m-1" type="submit" onClick={handleCancel}>Cancel</button>
            </div>
        </form>
    );
}