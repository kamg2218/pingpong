import '../../css/Game.css';
import ChatMenu from './ChatMenu'
import GameMenu from './GameMenu'
import { Route, Switch } from 'react-router-dom';

//최초 1회 - 

export default function Game(){
    return (
        <div className="container-fluid m-0 p-0" id="gamelobby">
            <div className='col'>
                <h1 className='row justify-content-center' id='gameHeader'>PONG CONTEST GAME</h1>
                <div className='mx-2'>
                    <Switch>
                        <Route path='/game/chat'><ChatMenu/></Route>
                        <Route path='/game'><GameMenu/></Route>
                    </Switch>
                </div>
            </div>
        </div>
    );
}