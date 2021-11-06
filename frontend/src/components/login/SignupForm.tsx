import '../../css/SignupForm.css';
import ProfileCarousel from './ProfileCarousel';

export default function SignupForm(){
    //let profile_img = '';
    // function handleProfile(adr: any) {
    //     console.log(adr.target.value);
    //     profile_img = <img id="signupImage" alt="profile" src={adr.target.value}/>;
    // }

    return (
        <form action="localhost:4242/api/signup" method="post" id="signupForm">
            <div className="form-group mb-3">
                <ProfileCarousel></ProfileCarousel>
                {/* <div className="center" id="signupProfile">{profile_img}</div>
                <div className="col-sm-12 col-lg-10 d-flex">
                    <label className="col-form-label mx-3">Profile</label>
                    <input type="file" className="form-control" id="inputProfile" onChange={handleProfile}/>
                </div> */}
            </div>
            <div className="form-group mb-3 d-flex">
                <label className="col-form-label">Nickname</label>
                <input type="text" className="form-control" id="inputNickname" placeholder="Nickname"/>
                <button type="button" className="btn btn-outline-dark mx-2" id="nickcheck">Check</button>
            </div>
            <div className="form-group mb-3 d-flex">
                <label className="col-sm-2 col-form-label">ID</label>
                <input type="email" className="form-control" id="inputId" placeholder="id@email.com"/>
                <button type="button" className="btn btn-outline-dark mx-2" id="emailcheck">Check</button>
            </div>
            <div className="form-group mb-3 d-flex">
                <label className="col-sm-2 col-form-label">Password</label>
                <input type="password" className="form-control" id="inputPassword" placeholder="password"/>
            </div>
            <div className="form-group col">
                <button type="button" className="btn btn-outline-dark mx-1" id="submit">Submit</button>
                <a className="btn btn-outline-dark mx-1" href="/" role="button">Cancel</a>
            </div>
        </form>
    );
}