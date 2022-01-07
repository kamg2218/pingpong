import { useEffect, useState } from 'react'
import '../../css/MenuGame.css'
import Profile from '../../icons/Profile'
import {myGameRoom, playroom} from '../../socket/gameSocket'

export default function MenuPlay(){
    const p1 = myGameRoom.players.findIndex((p)=> p.userid === playroom.player1);
    const p2 = myGameRoom.players.findIndex((p)=> p.userid === playroom.player2);
    const [s1, setS1] = useState<number>(0);
    const [s2, setS2] = useState<number>(0);
    
    useEffect(()=>{
        console.log('menu play');
    }, [s1, s2]);
    return (
        <div className='container m-1 p-2' id='menu'>
            <div className='col justify-content-center'>
                <div className="row">
                    <div className="col">
                        <img src={Profile(myGameRoom.players[p1].profile)} className="row mx-auto" alt="player1" id="player1"/>
                        <label className="row">{myGameRoom.players[p1]}</label>
                    </div>
                    <div className="col h3">VS</div>
                    <div className="col">
                        <img src={Profile(myGameRoom.players[p2].profile)} className="row mx-auto" alt="player2" id="player2"/>
                        <label className="row">{myGameRoom.players[p2]}</label>
                    </div>
                </div>
                <label className='row mx-3 my-2 justify-content-center' id='menuScore'>SCORE</label>
                <div className='row justify-content-center' id='winLose'>{s1} : {s2}</div>
            </div>
        </div>
    );
}