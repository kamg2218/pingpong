import '../css/Main.css';
import logo_brown from "../icons/logo_brown.png"

export default function Main(){
	const url = "http://localhost:4242/auth/login";
	return (
		<div className="container text-center" id="main">
			<div className="col">
				<img className="row mt-4" id="logo" src={logo_brown} alt="logo"/>
				<a className="row btn btn-outline-primary mx-2" id="loginButton" href={url} role="button">LOG IN</a>
			</div>
		</div>
	);
}