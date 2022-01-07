import SideMenuPlay from './SideMenuPlay'

export default function PlayRoom(){
    return (
        <div className="container-fluid m-0 p-0 min-vh-100 min-vw-100" id="gamelobby">
            <div className='col'>
                <h1 className='row justify-content-center' id='gameHeader'>PONG CONTEST GAME</h1>
                <div className='mx-1 row'>
                    <div className='col-md-4 col-lg-3 d-none d-sm-none d-md-block h-75'>
                        <SideMenuPlay></SideMenuPlay>
                    </div>
                    <div className='col'>
                        play
                    </div>
                </div>
            </div>
        </div>
    );
}