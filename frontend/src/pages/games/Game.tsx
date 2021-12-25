import '../../css/Game.css';
import ChatMenu from '../../components/chat/SideMenuChat'
import GameMenu from '../../components/games/SideMenuGame'
import GameRoom from './GameRoom'
import WaitingRoom from './WaitingRoom'
import { Route, Switch } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { socket, user } from '../../socket/userSocket';

export default function Game(){
    const [info, setInfo] = useState(user);
    
    useEffect(()=>{
        socket.emit("userInfo", ()=>{
            setInfo(info);
        });
        console.log('user info !!!');
    });
    return (
        <div className="container-fluid m-0 p-0" id="gamelobby">
            <div className='col'>
                <h1 className='row justify-content-center' id='gameHeader'>PONG CONTEST GAME</h1>
                <div className='mx-1 row'>
                    <div className='col-xs-10 col-md-4 col-lg-3 d-sm-none d-md-block'>
                        <Switch>
                            <Route path='/game/chat'><ChatMenu/></Route>
                            <Route path='/game/play/:id'><GameRoom/></Route>
                            <Route path='/game'><GameMenu/></Route>
                        </Switch>
                    </div>
                    <div className='d-none d-sm-block col'><WaitingRoom/></div>
                </div>
            </div>
        </div>
    );
}