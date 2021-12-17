import profile1 from '../../icons/profileImage1.png'
import profile2 from '../../icons/profileImage2.png'
import profile3 from '../../icons/profileImage3.png'
import profile4 from '../../icons/profileImage4.png'
import profile5 from '../../icons/profileImage5.png'
import profile6 from '../../icons/profileImage6.png'
import profile7 from '../../icons/profileImage7.png'
import profile8 from '../../icons/profileImage8.png'
import profile9 from '../../icons/profileImage9.png'
import {user} from '../../socket/userSocket'

export default function MyChatBox(props:any){
    let sendtime = '';
    let profile = profile1;

    function findProfile(){
        if (user.profile === 1)
            profile = profile1;
        else if (user.profile === 2)
            profile = profile2;
        else if (user.profile === 3)
            profile = profile3;
        else if (user.profile === 4)
            profile = profile4;
        else if (user.profile === 5)
            profile = profile5;
        else if (user.profile === 6)
            profile = profile6;
        else if (user.profile === 7)
            profile = profile7;
        else if (user.profile === 8)
            profile = profile8;
        else if (user.profile === 9)
            profile = profile9;
        else
            profile = profile1;
    }
    function makeTime(){
        let date = new Date();
        console.log(typeof date);
        const hour = date.getHours();
        const minutes = date.getMinutes();
        sendtime = `${hour}:${minutes}`;
    }

    findProfile();
    makeTime();
    
    return (
        <div className="container m-0 p-0" key={`${props.chatid}mychatbox${props.idx}`} id={props.idx}>
            <div className="row align-items-start justify-content-end">
                <div className="col-8">
                    <div className="row justify-content-end" id="mychatboxnickname">{user.nickname}</div>
                    <div className="row border rounded bg-light p-2 justify-content-end" id="mychatboxcontent">{props.content}</div>
                    <div className="row small text-muted">{sendtime}</div>
                </div>
                <img src={profile} className="col-2 rounded-circle m-1" alt="..."/>
            </div>
        </div>
    );
}