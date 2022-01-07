// import { useState } from 'react';
import Profile from '../../icons/Profile';
import {roomId, handleRoomId, gameRoomDetail, myGameRoom} from '../../socket/gameSocket'
import { socket } from '../../socket/userSocket';
import './waitingRoom.css'

export default function WaitingRoom(){
    // const [detail, setDetail] = useState<gameRoomDetail>(myGameRoom);

    return (
        <div className="container-fluid m-0 my-4 p-0 py-2 border">
            <div className="row-2 bg-light h2 text-dark d-flex justify-content-center" id="waitingroomtitle">
                {myGameRoom.title}
            </div>
            <div className="row-4 px-2 mt-5 mb-2 d-flex border" id="waitingroombox">
                <div className="col mx-5 border">
                    <img className="row-5" src={Profile(myGameRoom.players[0].profile)} alt="player1"></img>
                    <label className="row justify-content-center h3 my-1">{myGameRoom.players[0].nickname}</label>
                </div>
                <div className="col mx-5 border">
                    <img className={`row-5${myGameRoom.players.length !== 2 ? ' d-none': ''}`} src={Profile(myGameRoom.players[1]?.profile)} alt="player2"></img>
                    <label className="row justify-content-center h3 my-1">{myGameRoom.players[1]?.nickname}</label>
                </div>
            </div>
            <div className="row-4 px-3 my-5 d-flex border" id="waitingroomobserver">
                <div className="col mx-1 border">1</div>
                <div className="col mx-1 border">2</div>
                <div className="col mx-1 border">3</div>
                <div className="col mx-1 border">4</div>
                <div className="col mx-1 border">5</div>
            </div>
            <div className="row mx-1 border" id="waitingroombtn">
                <button className="col mx-5 btn btn-outline-dark">Start</button>
                <button className="col mx-5 btn btn-outline-dark">Exit</button>
            </div>
        </div>
    );
}