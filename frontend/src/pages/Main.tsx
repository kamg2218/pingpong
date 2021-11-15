import '../css/Main.css';
import axios from "axios";
// import fortytwo from '../icons/fortyTwo.svg';
// import four from '../icons/42-Final-sigle-seul.svg';

// const url = "https://api.intra.42.fr/oauth/authorize?client_id=ec2a017e9dd8ada1f0ef107f2ed75e7b166fecba09b252bb13859da4b4c5658d&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code";
const url = "http://localhost:4242/auth/login";

type Token = {
    accessToken: string;
    refreshToken: string;
};

export default function Main(){
    function handleLogin(){
        axios.get(`http://localhost:4242/auth/login`)
        .then((res)=>{ console.log(res);
            // (token: Token)=>{
            // if (token)
            //     document.cookie=`${token.accessToken}=${token.refreshToken}`;
        }).catch((err)=>{ console.log(err); });
    }

    return (
        <div className='container' id="container">
            <div className='container-xxl h1'>PONG CONTEST GAME</div>
            <div className='col mb-5' id="buttons">
                {/* <a className="btn btn-outline-primary mx-2 btn-lg" href="/user/signup" role="button">SIGN UP</a> */}
                <a className="btn btn-outline-primary mx-2 btn-lg" href={url} role="button" onClick={handleLogin}>LOG IN</a>
            </div>
            {/* {fortytwo} */}
            {/* <img src="../icons/42-Final-sigle-seul.svg" alt="42"></img> */}
            {/* {four} */}
        </div>
    );
}