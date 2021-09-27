import './Game.css';
import MenuGame from '../../components/games/MenuGame';
import MenuChat from '../../components/games/MenuChat';
import ChatRoom from '../../components/games/ChatRoom';
import WaitingRoom from '../../pages/games/WaitingRoom';
import GameRoom from '../../pages/games/GameRoom';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { useState } from 'react';

type Friend = {
    nick: string,
    state: boolean
}

type User = {
    id: string,
    nick: string,
    profile?: string,
    friendList: Array<Friend>,
    newFriendList?: Array<Friend>,
    win: number,
    lose: number
}

export default function Game(){
    const first :User = {
        id: 'ab',
        nick: 'first',
        profile: '../../icons/emoji-wink.svg',
        friendList: [{nick: 'first', state: true}, {nick: 'second', state: false}, {nick: 'second', state: false},{nick: 'second', state: false},{nick: 'second', state: false},{nick: 'second', state: false},{nick: 'second', state: false}, {nick: 'second', state: false},{nick: 'second', state: false},{nick: 'second', state: false}],
        newFriendList: [{nick: 'third', state: false}],
        win: 3,
        lose: 1
    }

    const [chatIdx, setIdx] = useState(-1);
    const getIdx = (idx :number) =>{
        setIdx(idx);
    }

    return (
        <BrowserRouter>
            <h1 id='gameHeader'>PONG CONTEST GAME</h1>
            <div className='d-flex' id='gameContents'>
                <div id='gameTab'>
                    <nav>
                        <div className="nav nav-tabs" id="nav-tab" role="tablist">
                            <button className="nav-link active" id="nav-game-tab" data-bs-toggle="tab" data-bs-target="#nav-game" type="button" role="tab" aria-controls="nav-game" aria-selected="true">Game</button>
                            <button className="nav-link" id="nav-chat-tab" data-bs-toggle="tab" data-bs-target="#nav-chat" type="button" role="tab" aria-controls="nav-chat" aria-selected="false">Chat</button>
                        </div>
                    </nav>
                    <div className="tab-content" id="nav-tabContent">
                        <div className="tab-pane fade show active" id="nav-game" role="tabpanel" aria-labelledby="nav-game-tab">
                            <MenuGame profile={first.profile} id={first.id} nick={first.nick} friendList={first.friendList} newFriendList={first.newFriendList} win={first.win} lose={first.lose} />
                        </div>
                        <div className="tab-pane fade" id="nav-chat" role="tabpanel" aria-labelledby="nav-chat-tab">
                            {chatIdx === -1 ? <MenuChat nick={first.nick} idx={chatIdx} getIdx={getIdx}/> : <ChatRoom nick={first.nick} idx={chatIdx} getIdx={getIdx}/>}
                        </div>
                    </div>
                </div>
                <Switch>
                    <Route path='/game/waiting'><WaitingRoom/></Route>
                    <Route path='/game/:id'><GameRoom/></Route>
                </Switch>
            </div>
        </BrowserRouter>
    );
}