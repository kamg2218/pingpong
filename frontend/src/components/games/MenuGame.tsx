import './MenuGame.css';
import lion from '../../icons/lion.jpg';

type Friend = {
    nick: string,
    state: boolean
}

type User = {
    id: string,
    nick: string,
    profile?: string,
    friendList: Array<Friend>,
    newFriendList?: Array<Friend>,
    win: number,
    lose: number
}

function NewList(users : Friend): any {

    //accept new friend
    const handleCheck = () => {
    
    }
    //decline new friend
    const handleCross = () => {

    }

    return (
        <div className='d-flex mx-3 col-8'>
            <div className='col-9 text-start' id='friendNick'>
                {users.nick}
                <i className="bi bi-exclamation-lg" id='exclamationMark'></i>
            </div>
            <i className="bi bi-check-lg" id='checkMark' onClick={handleCheck}/>
            <i className="bi bi-x-lg" id='crossMark' onClick={handleCross}/>
        </div>
    );
}

function OldList(users : Friend): any {
    return (
        <div className='d-flex mx-3'>
            <div className='col-9 text-start' id='friendNick'>{users.nick}</div>
            {users.state ? <i className="bi bi-circle-fill"/> : <i className="bi bi-circle"/>}
        </div>
    );
}

export default function MenuGame({id, nick, profile, win, lose, friendList, newFriendList}: User){
    return (
        <div id='menu'>
            {/* <div>{profile ?? 'NONE'}</div> */}
            {/* <img src={process.env.PUBLIC_URL + '/icons/lion.jpg'} className="img-circle lion" alt="Cinque Terre"/> */}
            <img src={lion} className="img-circle m-4 lion" alt="Cinque Terre"/>
            {/* <div>{id}</div> */}
            <div id='menuNick'>{nick}</div>
            <div>
                <label className='mx-3 my-2' id='menuRecord'>win : lose</label>
                <div id='winLose'>{win} : {lose}</div>
            </div>
            <div id='friendList' className='scroll-box m-2'>
                {newFriendList?.map(user => (NewList(user)))}
                {friendList.map(user => (OldList(user)))}
                {/* <MakeList User={user}/> ))} 왜 오류가 나는 거지??*/}
            </div>
            <br/>
        </div>
    );
}