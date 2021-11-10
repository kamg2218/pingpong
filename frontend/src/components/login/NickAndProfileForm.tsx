import axios from 'axios';
import { useState } from 'react';
import '../../css/NickAndProfileForm.css';
import Profile from "./ProfileCarousel";

const url = 'http://localhost:4242';

export default function Nick(){
    const [profile, setProfile] = useState<number>(0);
    const [nickname, setNickname] = useState<string>("");
    const [checkModalText, setCheckModalText] = useState<string>("ERROR");
    const nicknamePlaceholder:string = "2~12 characters only";

    function handleCheck(event : any){
        event.preventDefault();
        axios.get(`${url}/auth/check?nickname=${nickname}`)
        .then(res=>{console.log(res.data); setCheckModalText("사용 가능한 닉네임입니다.")})
        .catch(error=>{console.log(error); setCheckModalText("사용 불가능한 닉네임입니다.")});
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
        <form>
            <Profile profile={profile} setProfile={setProfile}></Profile>
            <div className="d-flex my-2">
                <label className="nickLabel m-2">Nickname</label>
                <input className="m-1" placeholder={nicknamePlaceholder} onChange={(event)=>setNickname(event.target.value)} required />
                <button className="btn btn-outline-dark m-1" type="button" data-toggle="modal" data-target="#checkModal" onClick={handleCheck}>Check</button>
                
                {/* check modal */}
                <div className="modal fade" id="checkModal" tabIndex={-1} role="dialog" aria-labelledby="checkModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="checkModalLabel">닉네임 중복 확인</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="false">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">{checkModalText}</div>
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