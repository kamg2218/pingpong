import React from 'react';
import './Game.css';
import WaitingRoom from './WaitingRoom';
import { Route, Link } from 'react-router-dom';

export default function Game(){
    return (
        <div>
            <div>Game</div>
            <Link to='/game/waiting'>Here!</Link>
            <Route path='/game/waiting'><WaitingRoom/></Route>
        </div>
    );
}