import '../../css/Game.css';
import MenuGame from '../../components/games/MenuGame';
import MenuChat from '../../components/chat/MenuChat';
import ChatRoom from '../../components/chat/ChatRoom';
import WaitingRoom from '../../pages/games/WaitingRoom';
import GameRoom from '../../pages/games/GameRoom';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { useState } from 'react';
import { socket, user } from '../../socket/userSocket';

//최초 1회 - 

export default function Game(){
    const [chatIdx, setIdx] = useState(-1);
    const getIdx = (idx :number) =>{
        setIdx(idx);
    }
    
    return (
        <div key='game' className="container-fluid m-0 p-0" id="gamelobby">
            <div className='col'>
                <h1 className='row justify-content-center' id='gameHeader'>PONG CONTEST GAME</h1>
                <div className='row' id='gameContents'>
                    <div className='col-xs-10 col-sm-5 col-lg-3' id='gameTab'>
                        <nav>
                            <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                <button className="nav-link active" id="nav-game-tab" data-bs-toggle="tab" data-bs-target="#nav-game" type="button" role="tab" aria-controls="nav-game" aria-selected="true">Game</button>
                                <button className="nav-link" id="nav-chat-tab" data-bs-toggle="tab" data-bs-target="#nav-chat" type="button" role="tab" aria-controls="nav-chat" aria-selected="false">Chat</button>
                            </div>
                        </nav>
                        <div className="tab-content" id="nav-tabContent">
                            <div key='game' className="tab-pane fade show active" id="nav-game" role="tabpanel" aria-labelledby="nav-game-tab">
                                <MenuGame></MenuGame>
                            </div>
                            <div key='chat' className="tab-pane fade" id="nav-chat" role="tabpanel" aria-labelledby="nav-chat-tab">
                                {chatIdx === -1 ? <MenuChat nick={user.nickname} getIdx={getIdx}/> : <ChatRoom nick={user.nickname} idx={chatIdx} getIdx={getIdx}/>}
                            </div>
                        </div>
                    </div>
                    <div className='col-sm-10'>
                        <Switch>
                            <Route path='/game/room'><GameRoom/></Route>
                            <Route path='/game/play'><WaitingRoom/></Route>
                            <Route path='/game'></Route>
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    );
}