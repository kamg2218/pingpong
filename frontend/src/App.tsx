// import './css/App.css';
import Main from './pages/Main';
import LoginError from './components/errors/LoginError';
import Game from './pages/games/Game';
import Admin from './pages/Admin';
import NickAndProfile from './pages/login/NickAndProfile';
import Qrcode from './pages/login/Qrcode';
import PlayRoom from './pages/games/PlayRoom'
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { GameContext, GameVariables } from './socket/gameSocket';
import { UserContext, UserVariables } from './socket/userSocket';
import { ChatContext, ChatVariables } from './socket/chatSocket';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <UserContext.Provider value={UserVariables()}>
          <Route exact path='/'><Main /></Route>
          <Route path='/loginerror'><LoginError/></Route>
          <Route path='/nickandprofile'><NickAndProfile/></Route>
          <Route path='/twofactor'><Qrcode/></Route>
          <ChatContext.Provider value={ChatVariables()}>
            <GameContext.Provider value={GameVariables()}>
              <Route path='/game/play/:id'><PlayRoom/></Route>
              <Route path='/game'><Game/></Route>
            </GameContext.Provider>
          </ChatContext.Provider>
          <Route path='/admin'><Admin/></Route>
          <Route><Main/></Route>
        </UserContext.Provider>
      </Switch>
    </BrowserRouter>
  );
}

export default App;