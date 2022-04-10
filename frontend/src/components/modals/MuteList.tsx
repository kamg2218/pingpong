import { useState } from "react";
import { User } from "../../types/userTypes";
import Profile from "../../icons/Profile";

export default function MuteList(props:any) {
  const person:User = props.person;
  const [checkedTen, setCheckedTen] = useState<boolean>(false);
  const [checkedThirty, setCheckedThirty] = useState<boolean>(false);
  
  const handleThirtyBox = (id: string) => {
    if (checkedTen){setCheckedTen(false);}
    props.handleThirtyBox(id, checkedTen);
    setCheckedThirty(!checkedThirty);
  }
  const handleTenBox = (id: string) => {
    if (checkedThirty){setCheckedThirty(false);}
    props.handleTenBox(id, checkedThirty);
    setCheckedTen(!checkedTen);
  }

  return (
    <div className="row" id="mutePerson" key={`mute_${person.userid}`}>
      <div className="col p-0" key={`mute_${person.userid}_img`}><img src={Profile(person.profile)} alt="profile" id="muteProfile" /></div>
      <div className="col" key={`mute_${person.userid}_nickname`}>{person.nickname}</div>
      <div className="col-2" key={`mute_${person.userid}_ten`}><input className="form-check-input" type="checkbox" value="10m" onClick={() => handleTenBox(person.userid)} checked={checkedTen}/></div>
      <div className="col-2" key={`mute_${person.userid}_thirty`}><input className="form-check-input" type="checkbox" value="30s" onClick={() => handleThirtyBox(person.userid)} checked={checkedThirty}/></div>
    </div>
  );
}