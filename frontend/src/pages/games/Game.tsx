import '../../css/Game.css'
import SideMenuChat from './SideMenuChat'
import SideMenuGame from './SideMenuGame'
import WaitingRoom from './WaitingRoom'
import Lobby from './Lobby'
import { Route, Switch } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { socket, user } from '../../socket/userSocket'
import {waitingRoomId} from '../../socket/gameSocket'

export default function Game(){
    const [info, setInfo] = useState(user);
    // const [id, setId] = useState<string>("");
    
    useEffect(()=>{
        socket.emit("userInfo", ()=>{
            setInfo(info);
        });
        console.log('user info !!!');
        socket.emit("myChatRoom");
    }, [info]);
    return (
        <div className="container-fluid m-0 p-0 h-100 w-100" id="gamelobby">
            <div className='col'>
                <h1 className='row justify-content-center' id='gameHeader'>PONG CONTEST GAME</h1>
                <div className='mx-1 row'>
                    <div className='col-xs-10 col-md-4 col-lg-3 d-sm-none d-md-block h-75'>
                        <Switch>
                            <Route path='/game/chat'><SideMenuChat/></Route>
                            <Route path='/game'><SideMenuGame/></Route>
                        </Switch>
                    </div>
                    <div className='d-none d-sm-block col'>
                        {/* <Lobby></Lobby> */}
                        {waitingRoomId === "" ? <Lobby/> : <WaitingRoom/>}
                    </div>
                </div>
            </div>
        </div>
    );
}