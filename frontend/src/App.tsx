import React from 'react';
import './css/App.css';
import Main from './pages/Main';
import LoginError from './components/errors/LoginError';
import LoginPage from './pages/login/LoginPage';
import Signup from './pages/login/Signup';
import Game from './pages/games/Game';
import Admin from './pages/Admin';
import NickAndProfile from './pages/login/NickAndProfile';
import { BrowserRouter, Route, Switch } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/'><Main /></Route>
        <Route path='/user/login'><LoginPage/></Route>
        <Route path='/loginerror'><LoginError/></Route>
        <Route path='/user/signup'><Signup/></Route>
        <Route path='/user/nickandprofile'><NickAndProfile/></Route>
        <Route path='/game'><Game/></Route>
        <Route path='/admin'><Admin/></Route>
        <Route><Main/></Route>
      </Switch>
      {/* <footer id='footer'>@42seoul</footer> */}
    </BrowserRouter>
  );
}

export default App;