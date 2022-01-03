import '../css/Main.css';

const url = "http://localhost:4242/auth/login";

export default function Main(){
    return (
        <div className='container' id="container">
            <div className='container-xxl h1'>PONG CONTEST GAME</div>
            <div className='col mb-5' id="buttons">
                <a className="btn btn-outline-primary mx-2 btn-lg" href={url} role="button">LOG IN</a>
            </div>
        </div>
    );
}