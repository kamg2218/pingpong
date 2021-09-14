import React from 'react';
import './NickAndProfile.css';

export default function NickAndProfile(){
    let profile_img = "";

    // function handleChange(adr:string) {
    //     profile_img = adr;
    // }
    
    return (
        <form action="localhost:3000/api/nickandprofile" method="post">
            <div className="form-group">
                {profile_img ? <img src={profile_img} className="rounded mx-auto d-block" alt="profile"/> : <i className="bi bi-person"></i>}
                <div className="col-sm-8 col-lg-3 d-flex">
                    <label className="col-sm-2 col-form-label mx-3">Profile</label>
                    <input type="file" className="form-control" id="inputProfile"/>
                </div>
            </div>
            <div className="form-group mb-3 row">
                <label className="col-sm-2 col-form-label">Nickname</label>
                <div className="col-sm-8 col-lg-3 d-flex">
                    <input type="text" className="form-control" id="inputNickname" placeholder="Nickname"/>
                    <button type="button" className="btn btn-outline-dark mx-2" id="check">Check</button>
                </div>
            </div>
            <div className="form-group col">
                <button type="button" className="btn btn-outline-dark mx-1" id="ok">OK</button>
                <button type="button" className="btn btn-outline-dark mx-1" id="cancel">Cancel</button>
            </div>
        </form>
    );
}