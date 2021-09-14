import './Main.css';
// import { Button } from 'bootstrap';

export default function Main(){
    return (
        <div className='container'>
            <div className='container-xxl'>PONG CONTEST GAME</div>
            <div className='d-grid gap-2 col-6 mx-auto'>
                <a className="btn btn-outline-primary btn-lg" href="/user/login" role="button">START</a>
            </div>
        </div>
    );
}