import { useState } from "react";
import { chatRoom, ChatUser } from "../../types/chatTypes";
import Profile from "../../icons/Profile";

export default function ManagerList({info, member, handleClick}:{info:chatRoom, member:ChatUser, handleClick:Function}){
  const idx:number = info.manager.findIndex((man:string)=>man === member.userid);
  const [checked, setChecked] = useState<boolean>(idx === -1 ? false : true);

  const handleManagerClick = () => {
    handleClick(member.userid, checked);
    setChecked(!checked);
  }

  return (
    <li className="form-check" key={`memberList_${member.userid}`}>
      <input className="form-check-input" type="checkbox" onClick={handleManagerClick} checked={checked}></input>
      <img src={Profile(member.profile)} className="col-1 mx-1 rounded-cricle" alt="..."></img>
      <label className="form-check-label mx-1">{member.nickname}</label>
    </li>
  );
}