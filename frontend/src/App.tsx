import React from 'react';
import './App.css';
import Main from './components/Main';
import LoginError from './components/errors/LoginError';
import Login from './components/login/Login';
import Signup from './components/login/Signup';
import Game from './components/games/Game';
import NickAndProfile from './components/login/NickAndProfile';
import { BrowserRouter, Route, Switch } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path='/'><Main /></Route>
          <Route path='/user/login'><Login/></Route>
          <Route path='/loginerror'><LoginError/></Route>
          <Route path='/user/signup'><Signup/></Route>
          <Route path='/user/nickandprofile'><NickAndProfile/></Route>
          <Route path='/game'><Game/></Route>
          <Route><Main/></Route>
        </Switch>
      </BrowserRouter> 
    </div>
  );
}

export default App;