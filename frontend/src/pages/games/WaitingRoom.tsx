import { useState } from 'react';
import {roomId, handleRoomId, gameRoomDetail} from '../../socket/gameSocket'

export default function WaitingRoom(props:any){
    const [detail, setDetail] = useState<gameRoomDetail>(props.detail);

    return (
        <div className="container">
            <div className="row">1</div>
            <div className="row">2</div>
            <div className="row">3</div>
            <div className="row">4</div>
        </div>
    );
}