import '../../css/MenuGame.css';
import lion from '../../icons/lion.jpg';
import {User, Friend} from '../../socket/userSocket';

export function NewList(users : Friend): any {
    //accept new friend
    const handleCheck = () => {
    }
    //decline new friend
    const handleCross = () => {
    }

    return (
        <div className='d-flex mx-3 col-8' key={users.nickname}>
            <div className='col-9 text-start' id='friendNick'>
                {users.nickname}
                <i className="bi bi-exclamation-lg" id='exclamationMark'></i>
            </div>
            <i className="bi bi-check-lg" id='checkMark' onClick={handleCheck}/>
            <i className="bi bi-x-lg" id='crossMark' onClick={handleCross}/>
        </div>
    );
}

export function OldList(users : Friend): any {
    return (
        <div className='d-flex mx-3' key={users.nickname}>
            <div className='col-9 text-start' id='friendNick'>{users.nickname}</div>
            {users.onoff ? <i className="bi bi-circle-fill"/> : <i className="bi bi-circle"/>}
        </div>
    );
}

export default function MenuGame({profile, id, nickname, friends, newfriends, win, lose, level, levelpoint, levelnextpoint, blacklist }: User){
    return (
        <div id='menu'>
            {/* <div>{profile ?? 'NONE'}</div> */}
            {/* <img src={process.env.PUBLIC_URL + '/icons/lion.jpg'} className="img-circle lion" alt="Cinque Terre"/> */}
            <img src={lion} className="img-circle m-4 lion" alt="Cinque Terre"/>
            {/* <div>{id}</div> */}
            <div id='menuNick'>{nickname}</div>
            <div>
                <label className='mx-3 my-2' id='menuRecord'>win : lose</label>
                <div id='winLose'>{win} : {lose}</div>
            </div>
            <div id='friendList' className='scroll-box m-2'>
                {newfriends?.map(user => (NewList(user)))}
                {friends.map(user => (OldList(user)))}
                {/* <MakeList User={user}/> ))} 왜 오류가 나는 거지??*/}
            </div>
            <br/>
        </div>
    );
}