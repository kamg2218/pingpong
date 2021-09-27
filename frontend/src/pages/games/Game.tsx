import './Game.css';
import Menu from '../../components/games/Menu';
import WaitingRoom from '../../components/games/WaitingRoom';
import GameRoom from '../../components/games/GameRoom';
import ChatList from '../../components/games/ChatList';
import { Route, BrowserRouter, Switch } from 'react-router-dom';

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
                            <Menu profile={first.profile} id={first.id} nick={first.nick} friendList={first.friendList} newFriendList={first.newFriendList} win={first.win} lose={first.lose}></Menu>
                        </div>
                        <div className="tab-pane fade" id="nav-chat" role="tabpanel" aria-labelledby="nav-chat-tab">
                            <ChatList></ChatList>
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