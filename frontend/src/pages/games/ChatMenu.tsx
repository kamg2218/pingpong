import '../../css/Game.css';
import MenuChat from '../../components/chat/MenuChat'
import WaitingRoom from '../../pages/games/WaitingRoom'
import GameRoom from '../../pages/games/GameRoom'
import { Route, Switch, Link } from 'react-router-dom'

export default function ChatMenu(){
    return (
        <div className='row' id='gameContents'>
            <div className='col-xs-10 col-sm-5 col-lg-3' id='gameTab'>
                <div className='row'>
                    <div className='col-3 btn border border-bottom-0 rounded-top' id='tab-game'>
                        <Link to='/game' className='text-decoration-none text-reset'>game</Link>
                    </div>
                    <div className='col-3 btn border border-bottom-0 rounded-top bg-light' id='tab-chat'>
                        <Link to='/game/chat' className='text-decoration-none text-reset'>chat</Link>
                    </div>
                </div>
                <div className='row border-top' id='nav-chat'>
                    <MenuChat></MenuChat>
                </div>
            </div>
            <div className='col'>
                <Switch>
                    <Route path='/game/chat/room'><GameRoom/></Route>
                    <Route path='/game/chat/play'><WaitingRoom/></Route>
                    <Route path='/game/chat'><GameRoom/></Route>
                </Switch>
            </div>
        </div>
    );
}