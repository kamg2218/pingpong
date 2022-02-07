import '../css/Main.css';
<<<<<<< HEAD
import logo_sky from "../icons/logo_sky.png"
import logo_earth from "../icons/logo_earth.png"
import logo_brown from "../icons/logo_brown.png"

export default function Main(){
	const url = "http://localhost:4242/auth/login";
	return (
		<div className="container text-center" id="main">
			<div className="col">
				<img className="row mt-4" id="logo" src={logo_brown} alt="logo"/>
				<a className="row btn btn-outline-primary mx-2 btn-lg" id="loginButton" href={url} role="button">LOG IN</a>
			</div>
		</div>
	);
=======
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
>>>>>>> main
}