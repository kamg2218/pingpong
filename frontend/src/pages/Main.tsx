import '../css/Main.css';
import axios from "axios";

const url = "https://api.intra.42.fr/oauth/authorize?client_id=ec2a017e9dd8ada1f0ef107f2ed75e7b166fecba09b252bb13859da4b4c5658d&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code";

export default function Main(){
    return (
        <div className='container' id="container">
            <div className='container-xxl h1'>PONG CONTEST GAME</div>
            <div className='col mb-5' id="buttons">
                <a className="btn btn-outline-primary mx-2 btn-lg" href={url} role="button">LOGIN</a>
            </div>
        </div>
    );
}