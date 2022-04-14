import { gameRoomDetail } from "../../types/gameTypes";
import Profile from "../../icons/Profile"

export default function ObserverProfileBox({idx, room}:{idx:number, room:gameRoomDetail}) {
  if (room && room.observer && room.observer.length > idx){
    return (
      <div id={room.observer[idx].userid}>
        <img className="row mx-auto img-fluid img-thumbnail" id="observer" src={Profile(room.observer[idx].profile)} alt={room.observer[idx].userid}></img>
        <label className="row justify-content-center" id="profileLabel">{room.observer[idx].nickname}</label>
      </div>
    );
  }
  return <div id="observer"></div>;
}