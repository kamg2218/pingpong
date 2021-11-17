import React from 'react';
import './css/App.css';
import Main from './pages/Main';
import LoginError from './components/errors/LoginError';
import NickAndProfile from './pages/login/NickAndProfile';
import { BrowserRouter, Route, Switch } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/'><Main /></Route>
        <Route path='/loginerror'><LoginError/></Route>
        <Route path='/user/nickandprofile'><NickAndProfile/></Route>
        <Route path='/game'></Route>
        <Route><Main/></Route>
      </Switch>
      {/* <footer id='footer'>@42seoul</footer> */}
    </BrowserRouter>
  );
}

export default App;