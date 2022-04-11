import { useState } from "react";
import { ChatUser } from "../../types/chatTypes";
import Profile from "../../icons/Profile";

export default function MuteList({person, handleTenBox, handleThirtyBox}:{person:ChatUser, handleTenBox:Function, handleThirtyBox:Function}) {
  const [checkedTen, setCheckedTen] = useState<boolean>(false);
  const [checkedThirty, setCheckedThirty] = useState<boolean>(false);
  
  const handleMuteThirtyBox = (id: string) => {
    if (checkedTen){setCheckedTen(false);}
    handleThirtyBox(id, checkedTen);
    setCheckedThirty(!checkedThirty);
  }
  const handleMuteTenBox = (id: string) => {
    if (checkedThirty){setCheckedThirty(false);}
    handleTenBox(id, checkedThirty);
    setCheckedTen(!checkedTen);
  }

  return (
    <div className="row" id="mutePerson" key={`mute_${person.userid}`}>
      <div className="col p-0" key={`mute_${person.userid}_img`}><img src={Profile(person.profile)} alt="profile" id="muteProfile" /></div>
      <div className="col" key={`mute_${person.userid}_nickname`}>{person.nickname}</div>
      <div className="col-2" key={`mute_${person.userid}_ten`}><input className="form-check-input" type="checkbox" value="10m" onClick={() => handleMuteTenBox(person.userid)} checked={checkedTen}/></div>
      <div className="col-2" key={`mute_${person.userid}_thirty`}><input className="form-check-input" type="checkbox" value="30s" onClick={() => handleMuteThirtyBox(person.userid)} checked={checkedThirty}/></div>
    </div>
  );
}