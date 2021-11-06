import '../../css/NickAndProfileForm.css';

export default function NickAndProfileForm(){
    let profile_img = <svg xmlns="http://www.w3.org/2000/svg" width="130" height="130" fill="currentColor" className="bi bi-emoji-wink" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm1.757-.437a.5.5 0 0 1 .68.194.934.934 0 0 0 .813.493c.339 0 .645-.19.813-.493a.5.5 0 1 1 .874.486A1.934 1.934 0 0 1 10.25 7.75c-.73 0-1.356-.412-1.687-1.007a.5.5 0 0 1 .194-.68z"/></svg>;

    function handleProfile(adr: any) {
        console.log(adr.target.value);
        profile_img = <img id="nickandprofileImage" alt="profile" src={adr.target.value}/>;
    }
    
    return (
        <form action="localhost:4242/api/nickandprofile" method="post" id="nickandprofileForm" className='col-sm-7 col-lg-5'>
            <div className="center" id="Profile">{profile_img}</div>
            <div className="col-sm-12 col-lg-10 d-flex my-2">
                <label className="col-form-label mx-3">Profile</label>
                <input type="file" className="form-control" id="inputProfile" onChange={handleProfile}/>
            </div>
            <div className="form-group mb-3 col-sm-12 col-lg-10 d-flex my-2">
                <label className="col-form-label mx-2">Nickname</label>
                <input type="text" className="form-control" id="inputNickname" placeholder="Nickname"/>
                <button type="button" className="btn btn-outline-dark mx-1" id="check">Check</button>
            </div>
            <div className="form-group col">
                <button type="button" className="btn btn-outline-dark mx-1" id="ok">OK</button>
                <a className="btn btn-outline-dark mx-1" href="/" role="button">Cancel</a>
            </div>
        </form>
    );
}