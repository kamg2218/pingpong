import '../../css/Game.css';
import MenuGame from '../../components/games/MenuGame'
import WaitingRoom from '../../pages/games/WaitingRoom';
import GameRoom from '../../pages/games/GameRoom';
import { Route, Switch, Link } from 'react-router-dom';

//최초 1회 - 

export default function GameMenu(){
    return (
        <div className='row' id='gameContents'>
            <div className='col-xs-10 col-sm-5 col-lg-3' id='gameTab'>
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
            <div className='col'>
                <Switch>
                    <Route path='/game/play'><WaitingRoom/></Route>
                    <Route path='/game/room'><GameRoom/></Route>
                    <Route path='/game'><GameRoom/></Route>
                </Switch>
            </div>
        </div>
    );
}