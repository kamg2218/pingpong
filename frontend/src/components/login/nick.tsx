import axios from 'axios';
import { useState } from 'react';
import './Nick.css';
import Profile from "./ProfileCarousel";

const url = 'http://localhost:4242';

export default function Nick(){
    const [profile, setProfile] = useState<number>(0);
    const [nickname, setNickname] = useState<string>("");
    const nicknamePlaceholder:string = "2~12 characters only";

    function handleCheck(event : any){
        event.preventDefault();
        console.log(nickname);
        console.log(profile);
        axios.get(`${url}/auth/check?nickname=${nickname}`)
        .then(res=>{console.log(res.data)})
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
    const tab:number = -1;

    return (
        <form>
            <Profile profile={profile} setProfile={setProfile}></Profile>
            <div className="d-flex my-2">
                <label className="nickLabel m-2">Nickname</label>
                <input className="m-1" placeholder={nicknamePlaceholder} onChange={(event)=>setNickname(event.target.value)} required />
                <button className="btn btn-outline-dark m-1" data-toggle="modal" data-target="#checkModal" onClick={handleCheck}>Check</button>

                {/* modal */}
                <div className="modal fade" id="checkModal" tabIndex={tab} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                ...
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <button className="btn btn-outline-dark m-1" type="submit" onClick={handleOK}>OK</button>
                <button className="btn btn-outline-dark m-1" type="submit" onClick={handleCancel}>Cancel</button>
            </div>
        </form>
    );
}