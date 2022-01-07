import { useEffect, useState } from 'react';
import Profile from '../../icons/Profile';
import LoadingModal from '../../components/modals/LoadingModal'
import {roomId, handleRoomId, gameRoomDetail, myGameRoom} from '../../socket/gameSocket'
import { socket } from '../../socket/userSocket';
import './waitingRoom.css'

export default function WaitingRoom(){
    const [detail, setDetail] = useState<gameRoomDetail>(myGameRoom);

    useEffect(()=>{
        console.log('useEffect');
    }, [detail]);
    const profileBox = (id:string, profile:string, nick:string, player:boolean) => {
        return (
            <div className={`m-1 ${player ? 'player':'observer'}`} id={id}>
                <img className="row mx-auto img-fluid img-thumbnail" src={profile} alt={id}></img>
                <label className={`row justify-content-center my-1 ${player ? 'h4':'h6'}`}>{nick}</label>
            </div>
        );
    }
    const handleStart = () => {
        socket.emit("startGame", {
            roomid: myGameRoom.roomid
        });
    }
    const handleExit = () => {
        socket.emit("exitGameRoom", {
            roomid: myGameRoom.roomid
        });
    }
    return (
        <div className="container-fluid m-0 mt-4 p-0 pb-2 bg-secondary bg-gradient">
            <div className="row-2 bg-light h2 text-dark d-flex justify-content-center" id="waitingroomtitle">
                {myGameRoom.title}
            </div>
            <div className="row-4 px-2 mt-5 mb-2 d-flex justify-content-center" id="waitingroombox">
                <div className="col-3 mx-5 px-3 bg-light border">
                    {profileBox(myGameRoom.players[0].userid, Profile(myGameRoom.players[0].profile), myGameRoom.players[0].nickname, true)}
                </div>
                <div className="col-3 mx-5 px-3 bg-light border">
                    {!myGameRoom.players[1] ?? profileBox(myGameRoom.players[1].userid, Profile(myGameRoom.players[1].profile), myGameRoom.players[1].nickname, true)}
                </div>
            </div>
            <div className="row-4 px-3 my-5 d-flex" id="waitingroomobserver">
                <div className="col mx-1 border">{myGameRoom.observer[0] ? profileBox(myGameRoom.observer[0].userid, Profile(myGameRoom.observer[0].profile), myGameRoom.observer[0].nickname, false):''}</div>
                <div className="col mx-1 border">{myGameRoom.observer[1] ? profileBox(myGameRoom.observer[1].userid, Profile(myGameRoom.observer[1].profile), myGameRoom.observer[1].nickname, false):''}</div>
                <div className="col mx-1 border">{myGameRoom.observer[2] ? profileBox(myGameRoom.observer[2].userid, Profile(myGameRoom.observer[2].profile), myGameRoom.observer[2].nickname, false):''}</div>
                <div className="col mx-1 border">{myGameRoom.observer[3] ? profileBox(myGameRoom.observer[3].userid, Profile(myGameRoom.observer[3].profile), myGameRoom.observer[3].nickname, false):''}</div>
                <div className="col mx-1 border">{myGameRoom.observer[4] ? profileBox(myGameRoom.observer[4].userid, Profile(myGameRoom.observer[4].profile), myGameRoom.observer[4].nickname, false):''}</div>
            </div>
            <div className="row mx-3 my-2" id="waitingroombtn">
                <button className="col mx-5 my-2 btn btn-outline-dark" onClick={handleStart} data-toggle='modal' data-target='#LoadingModal' data-backdrop="static" data-keyboard="false">Start</button>
                <button className="col mx-5 my-2 btn btn-outline-dark" onClick={handleExit}>Exit</button>
            </div>
            <LoadingModal content='잠시만 기다려 주세요'></LoadingModal>
        </div>
    );
}