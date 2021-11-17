import axios from 'axios';
import { useState } from 'react';
import '../../css/NickAndProfileForm.css';
import Profile from "./ProfileCarousel";

const url = 'http://localhost:4242';
const frontUrl = 'http://localhost:3000';

export default function Nick(){
    const [profile, setProfile] = useState<number>(0);
    const [nickname, setNickname] = useState<string>("");
    const [checkModalText, setCheckModalText] = useState<string>("ERROR");
    const nicknamePlaceholder:string = "2~12 characters only";
    const btn = document.querySelector("#okBtn");

    function handleInput(event: any){
        setNickname(event.target.value);
        if (btn && !btn.getAttribute("data-toggle")){
            btn.setAttribute("data-toggle", "modal");
            btn.setAttribute("data-target", "#okModal");
            setCheckModalText("중복 확인 해주세요!");
        }
    }
    function handleCheck(event : any){
        event.preventDefault();
        axios.get(`${url}/auth/check?nickname=${nickname}`)
        .then(res=>{console.log(res.data); setCheckModalText("사용 가능한 닉네임입니다.")})
        .catch(error=>{console.log(error); setCheckModalText("사용 불가능한 닉네임입니다.")});
        if (btn){
            btn.removeAttribute("data-toggle");
            btn.removeAttribute("data-target");
        }
    }
    function handleOK(event: any){
        event.preventDefault();
        if (conditionals() === false)
            return ;
        axios.post(`${url}/auth/signup`, { nickname, profile }, {withCredentials: true}
        ).then(res=>{
            console.log(res);
            console.log(res.data);
            if (res.data === 'cookie set')
                window.location.href = `${frontUrl}/game`;
        }).catch(err=>{
            console.error(err);
        });
    }
    function handleCancel(event: any){
        event.preventDefault();
        window.location.href = '/';
    }
    function conditionals(): Boolean{
        if (nickname === "")
            return false;
        else if (checkModalText !== "사용 가능한 닉네임입니다.")
            return false;
        return true;
    }

    return (
        <form>
            <Profile profile={profile} setProfile={setProfile}></Profile>
            <div className="d-flex my-2">
                <label className="nickLabel m-2">Nickname</label>
                <input className="m-1" placeholder={nicknamePlaceholder} onChange={handleInput} required />
                <button className="btn btn-outline-dark m-1" data-toggle="modal" data-target="#checkModal" onClick={handleCheck}>Check</button>
                {/* check modal */}
                <div className="modal fade" id="checkModal" tabIndex={-1} role="dialog" aria-labelledby="checkModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-sm" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="checkModalLabel">닉네임 중복 확인</h5>
                                <button type="button" className="close btn btn-outline-dark" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="false">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">{checkModalText}</div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-dark" data-dismiss="modal">OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <button className="btn btn-outline-dark m-1" id="okBtn" type="submit" data-toggle="modal" data-target="#okModal" onClick={handleOK}>OK</button>
                <button className="btn btn-outline-dark m-1" type="submit" onClick={handleCancel}>Cancel</button>
                {/* ok modal */}
                <div className="modal" id="okModal" tabIndex={-1} role="dialog" aria-labelledby="okModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-sm" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="okModalLabel"> </h5>
                                <button type="button" className="close btn btn-outline-dark" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="false">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div id="doubleCheck">닉네임 중복 확인을 해주세요.</div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-dark" data-dismiss="modal">OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}