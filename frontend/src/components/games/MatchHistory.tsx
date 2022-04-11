import "./matchHistory.css"
import Profile from '../../icons/Profile'
import { History } from "../../types/userTypes";

export default function MatchHistory({userid, matchHistory}:{userid?:string, matchHistory?:Array<History>}) {
	const createHistory = () => {
		let list: Array<any> = [];

		matchHistory?.forEach((history: any) => {
			list.push(
				<div className="row " key={`matchHistoryBlock_${history.nick}`}>
					<div className="col mt-1" key={`histroyProfile_${history.nick}`}><img src={Profile(history.profile)} alt="profile" id="matchProfile" /></div>
					<div className="col" key={`historyNickname_${history.nick}`}>{history.nick}</div>
					<div className="col" key={`historyWinlose_${history.nick}`}>{history.winner === userid ? "승" : "패"}</div>
				</div>
			);
		});
		return list;
	}

	return (
		<div className="container col" key="matchHistory">
			<div className="row mb-2" id="matchTitle" key="matchTitle">
				<div className="col" key="profile">프로필</div>
				<div className="col" key="nickname">닉네임</div>
				<div className="col" key="winlose">승/패</div>
			</div>
			{matchHistory && createHistory()}
		</div>
	);
}