import { shallowEqual, useSelector } from "react-redux";
import { Friend, User } from "../../types/userTypes";
import { RootState } from "../../redux/rootReducer";

export default function InviteList(props:any){
	let members:Array<string> = [];
	const user:User = useSelector((state:RootState) => state.userReducer.user, shallowEqual);

	function checkbox(data:Friend){
		const handleClick = async (data:Friend) => {
			if (members.find(idx => idx === data.userid)) {
				members.filter(idx => idx !== data.userid);
			}else {
				members.push(data.userid);
			}
			props.setMembers(members);
		}
		return (
			<li className="form-check m-2" key={data.userid}>
				<input className="form-check-input" type="checkbox" value="" onClick={()=>handleClick(data)}></input>
				<label className="form-check-label mx-1">{data.nickname}</label>
			</li>
		);
	}
	
	return (
		<ul key="inviteList">
			{user && user.friends?.map((friend:Friend)=>checkbox(friend))}
		</ul>
	);
}