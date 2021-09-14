import React from 'react';
import './Signup.css';

export default function Signup(){
    let profile_img;

    return (
        <div>
            <h1>Sign up</h1>
            <div>------service signup--------</div>
            <button>Google</button>
            <button>42Seoul</button>
            <div>------server signup--------</div>
            <form action="localhost:3000/api/signup" method="post">
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
                        <button type="button" className="btn btn-outline-dark mx-2" id="nickcheck">Nick Check</button>
                    </div>
                </div>
                <div className="form-group my-3 row">
                    <label className="col-sm-2 col-form-label">ID</label>
                    <div className="col-sm-8 col-lg-3 d-flex">
                        <input type="id" className="form-control" id="inputId" placeholder="id@email.com"/>
                        <button type="button" className="btn btn-outline-dark mx-2" id="emailcheck">ID Check</button>
                    </div>
                </div>
                <div className="form-group mb-3 row">
                    <label className="col-sm-2 col-form-label">Password</label>
                    <div className="col-sm-8 col-lg-3">
                        <input type="password" className="form-control" id="inputPassword" placeholder="password"/>
                    </div>
                </div>
                <div className="form-group col">
                    <button type="button" className="btn btn-outline-dark mx-1" id="submit">Submit</button>
                    <button type="button" className="btn btn-outline-dark mx-1" id="cancel">Cancel</button>
                </div>
            </form>
        </div>

    );
}