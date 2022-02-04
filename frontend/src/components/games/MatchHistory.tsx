import "./matchHistory.css"
import Profile from '../../icons/Profile'

export default function MatchHistory(props: any){
    const createHistory = () => {
        let list:Array<any> = [];

        props.matchHistory.forEach((history :any)=>{
            list.push(
                <div className="row">
                    <div className="col"><img src={Profile(history.profile)} alt="profile" id="matchProfile"/></div>
                    <div className="col">{history.nick}</div>
                    <div className="col">{history.winner === props.userid ? "승" : "패"}</div>
                </div>
            );
        });
        return list;
    }

    return (
        <div className="container col">
            <div className="row border-bottom mb-2">
                <div className="col">프로필</div>
                <div className="col">닉네임</div>
                <div className="col">승/패</div>
            </div>
            {props.matchHistory && createHistory()}
        </div>
    );
}