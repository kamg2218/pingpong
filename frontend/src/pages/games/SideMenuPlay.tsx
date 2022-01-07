import MenuPlay from '../../components/games/MenuPlay'

export default function SideMenuPlay(){
    return (
        <div id='playTab'>
            <div className='row'>
                <div className='col-3 btn border border-bottom-0 rounded-top bg-light' id='tab-play'>
                    play
                </div>
            </div>
            <div className='row border-top' id='nav-play'>
                <MenuPlay></MenuPlay>
            </div>
        </div>
    );
}