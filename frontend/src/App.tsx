import Main from './pages/Main';
import Game from './pages/games/Game';
import Play from './pages/games/Play'
import Qrcode from './pages/login/Qrcode';
import NickAndProfile from './pages/login/NickAndProfile';
import { BrowserRouter, Route, Switch } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/'><Main /></Route>
        <Route path='/nickandprofile'><NickAndProfile/></Route>
        <Route path='/twofactor'><Qrcode/></Route>
        <Route path='/game/play/:id'><Play/></Route>
        <Route path='/game'><Game/></Route>
        <Route><Main/></Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;