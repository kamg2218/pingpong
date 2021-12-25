import { useState } from 'react'
import '../../css/MenuGame.css'
import Profile from '../../icons/Profile'
import {Friend, user, socket} from '../../socket/userSocket'

export function NewList(person: Friend): any {
    const [newone, setNewone] = useState(user.newfriends);

    console.log(person);
    const handleNewFriend = (result: boolean) => {
        console.log(result);
        socket.emit("newFriend", {
            userid: person.userid,
            result: result
        }, ()=>{
            user.newfriends.filter(p => p.userid !== person.userid);
            // setNewone(newone.filter(p => p.userid !== person.userid));
            setNewone(user.newfriends);   
        });
        console.log(newone);
    }

    return (
        <div className='d-flex m-0 p-2' id='friendonoff' key={person.nickname}>
            <div className='col-7 text-start' id='friendNick'>
                <i className="bi bi-exclamation-lg" id='exclamationMark'></i>
                {person.nickname}
            </div>
            <i className="bi bi-check-lg mx-1" id='checkMark' onClick={()=>handleNewFriend(true)}/>
            <i className="bi bi-x-lg mx-1" id='crossMark' onClick={()=>handleNewFriend(false)}/>
        </div>
    );
}

export function OldList(person: Friend): any {
    return (
        <div className='btn d-flex m-0 p-1' id='friendonoff' key={person.nickname}>
            <div className='col-8 text-start' id='friendNick'>{person.nickname}</div>
            {person.onoff ? <i className="bi bi-circle-fill"/> : <i className="bi bi-circle"/>}
        </div>
    );
}

export default function MenuGame(){
    return (
        <div className='container m-1 p-2' id='menu'>
            <div className='col justify-content-center'>
                <img src={Profile(user.profile ?? 1)} className="row mx-auto my-4" alt="profile" id="profile"/>
                <div id='menuNick' className='row justify-content-center'>{user.nickname}</div>
                <label className='row mx-3 my-2 justify-content-center' id='menuRecord'>WIN : LOSE</label>
                <div className='row justify-content-center' id='winLose'>{user.win} : {user.lose}</div>
                <div className='row scroll-box m-1 p-1 border justify-content-center' id='friendList'>
                    {user.newfriends?.map(people => (NewList(people)))}
                    {user.friends.map(people => (OldList(people)))}
                </div>
            </div>
        </div>
    );
}