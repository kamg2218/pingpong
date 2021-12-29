import Profile from '../../icons/Profile';
import {user} from '../../socket/userSocket'

export default function MyChatBox(props:any){
    //받은 시간으로 수정 필요함.
    const makeTime = () => {
        let date = new Date();
        console.log(typeof date);
        const hour = date.getHours();
        const minutes = date.getMinutes();
        return `${hour}:${minutes}`;
    }
    return (
        <div className="container m-0 p-0" key={`${props.chatid}mychatbox${props.idx}`} id={props.idx}>
            <div className="row align-items-start justify-content-end">
                <div className="col-8">
                    <div className="row justify-content-end" id="mychatboxnickname">{user.nickname}</div>
                    <div className="row border rounded bg-light p-2 justify-content-end" id="mychatboxcontent">{props.content}</div>
                    <div className="row small text-muted">{makeTime()}</div>
                </div>
                <img src={Profile(user.profile)} className="col-2 rounded-circle m-1" alt="..."/>
            </div>
        </div>
    );
}