import Main from './pages/Main';
import Game from './pages/games/Game';
import Play from './pages/games/Play';
import Qrcode from './pages/login/Qrcode';
import NickAndProfile from './pages/login/NickAndProfile';
import { BrowserRouter, Route, Switch } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Main}></Route>
        <Route path='/nickandprofile' component={NickAndProfile}></Route>
        <Route path='/twofactor' component={Qrcode}></Route>
        <Route path='/game/play/:id' component={Play}></Route>
        <Route path='/game' component={Game}></Route>
        <Route component={Main}></Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;