import Main from './pages/Main';
import Game from './pages/games/Game';
import Admin from './pages/Admin';
import NickAndProfile from './pages/login/NickAndProfile';
import Qrcode from './pages/login/Qrcode';
import Play from './pages/games/Play'
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { GameContext, GameVariables } from './socket/gameSocket';
import { UserContext, UserVariables } from './socket/userSocket';
import { ChatContext, ChatVariables } from './socket/chatSocket';

function App() {
  return (
    <BrowserRouter>
      <UserContext.Provider value={UserVariables()}>
        <ChatContext.Provider value={ChatVariables()}>
          <GameContext.Provider value={GameVariables()}>
            <Switch>
              <Route exact path='/'><Main /></Route>
              <Route path='/nickandprofile'><NickAndProfile/></Route>
              <Route path='/twofactor'><Qrcode/></Route>
              <Route path='/game/play/:id'><Play/></Route>
              <Route path='/game'><Game/></Route>
              <Route path='/admin'><Admin/></Route>
              <Route><Main/></Route>
            </Switch>
          </GameContext.Provider>
        </ChatContext.Provider>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;