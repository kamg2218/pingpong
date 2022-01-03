import MenuGame from '../../components/games/MenuGame'

export default function SideMenuPlay(){
    return (
        <div id='playTab'>
            <div className='row'>
                <div className='col-3 btn border border-bottom-0 rounded-top bg-light' id='tab-play'>
                    play
                </div>
            </div>
            <div className='row border-top' id='nav-game'>
                <MenuGame></MenuGame>
            </div>
        </div>
    );
}