import '../../css/Game.css';
import ChatMenu from './ChatMenu'
import GameMenu from './GameMenu'
import GameRoom from './GameRoom'
import WaitingRoom from './WaitingRoom'
import { Route, Switch } from 'react-router-dom';

//최초 1회 - 

export default function Game(){
    return (
        <div className="container-fluid m-0 p-0" id="gamelobby">
            <div className='col'>
                <h1 className='row justify-content-center' id='gameHeader'>PONG CONTEST GAME</h1>
                <div className='mx-1 row'>
                    <div className='col-xs-10 col-sm-5 col-lg-3'>
                        <Switch>
                            <Route path='/game/chat'><ChatMenu/></Route>
                            <Route path='/game/play/:id'><GameRoom/></Route>
                            <Route path='/game'><GameMenu/></Route>
                        </Switch>
                    </div>
                    <div className='col'><WaitingRoom/></div>
                </div>
            </div>
        </div>
    );
}