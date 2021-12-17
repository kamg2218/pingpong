import profile1 from '../../icons/profileImage1.png'
import profile2 from '../../icons/profileImage2.png'
import profile3 from '../../icons/profileImage3.png'
import profile4 from '../../icons/profileImage4.png'
import profile5 from '../../icons/profileImage5.png'
import profile6 from '../../icons/profileImage6.png'
import profile7 from '../../icons/profileImage7.png'
import profile8 from '../../icons/profileImage8.png'
import profile9 from '../../icons/profileImage9.png'
import {chatroom} from '../../socket/chatSocket'

export default function ChatBox(props:any){
    let sendtime = '';
    let profile = profile1;
    const room = chatroom.chatroom.find(data => data.chatid === props.chatid);
    const member = room?.members.find(person => person.userid === props.userid);

    function findProfile(){
        console.log(member);
        if (member?.profile === 1)
            profile = profile1;
        else if (member?.profile === 2)
            profile = profile2;
        else if (member?.profile === 3)
            profile = profile3;
        else if (member?.profile === 4)
            profile = profile4;
        else if (member?.profile === 5)
            profile = profile5;
        else if (member?.profile === 6)
            profile = profile6;
        else if (member?.profile === 7)
            profile = profile7;
        else if (member?.profile === 8)
            profile = profile8;
        else if (member?.profile === 9)
            profile = profile9;
        else
            profile = profile1;
    }
    function makeTime(){
        let date = new Date();
        console.log(typeof date);
        const hour = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        sendtime = `${hour}:${minutes}`;
    }

    findProfile();
    makeTime();
    
    return (
        <div className="container-fluid m-0 p-0" key={`${props.chatid}chatbox${props.idx}`} id={props.idx}>
            <div className="row align-items-start">
                <img src={profile} className="col-2 rounded-circle m-1" alt="..."/>
                <div className="col-8">
                    <div className="row">{member ? member.nickname : 'unknown'}</div>
                    <div className="row border rounded bg-light p-2">{props.content}</div>
                    <div className="row small text-muted my-1 justify-content-end">{sendtime}</div>
                </div>
            </div>
        </div>
    );
}