import React from 'react';
// import './css/App.css';
import Main from './pages/Main';
import LoginError from './components/errors/LoginError';
import Game from './pages/games/Game';
import Admin from './pages/Admin';
import NickAndProfile from './pages/login/NickAndProfile';
import Qrcode from './pages/login/Qrcode';
import { BrowserRouter, Route, Switch } from "react-router-dom";

function App() {
  return (
    <BrowserRouter> 
      <div className='h-100 w-100'>
        <Switch>
          <Route exact path='/'><Main /></Route>
          <Route path='/loginerror'><LoginError/></Route>
          <Route path='/user/nickandprofile'><NickAndProfile/></Route>
          <Route path='/twofactor'><Qrcode/></Route>
          <Route path='/game'><Game/></Route>
          <Route path='/admin'><Admin/></Route>
          <Route><Main/></Route>
        </Switch>
        {/* <footer id='footer'>@42seoul</footer> */}
      </div>
    </BrowserRouter>
  );
}

export default App;