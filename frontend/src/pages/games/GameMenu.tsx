import '../../css/Game.css';
import MenuGame from '../../components/games/MenuGame'
import { Link } from 'react-router-dom'

export default function GameMenu(){
    return (
        <div id='gameTab'>
            <div className='row'>
                <div className='col-3 btn border border-bottom-0 rounded-top bg-light' id='tab-game'>
                    <Link to='/game' className='text-decoration-none text-reset'>game</Link>
                </div>
                <div className='col-3 btn border border-bottom-0 rounded-top' id='tab-chat'>
                    <Link to='/game/chat' className='text-decoration-none text-reset'>chat</Link>
                </div>
            </div>
            <div className='row border-top' id='nav-game'>
                <MenuGame></MenuGame>
            </div>
        </div>
    );
}