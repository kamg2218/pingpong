import {useState} from 'react'
import InputPwdModal from '../modals/InputPwdModal'
import {socket} from '../../socket/userSocket'

type info = {
    roomid: String,
    isPlayer: boolean,
    password?: String
}

export default function GameBox(props:any){
    const [state, setState] = useState<boolean>(false);
    const [pwd, setPwd] = useState<String>("");

    const handleEnterGameRoom = () => {
        let info:info = {
            roomid: props.info.roomid,
            isPlayer: state
        }
        if (pwd !== "")
            info.password = pwd;
        socket.emit("enterGameRoom", info);
    }
    const handlePwd = (result: boolean) => {
        const k: string = result ? `${props.info.roomid}BoxPlaying` : `${props.info.roomid}BoxWatching`;
        const content: string = result ? '게임하기' : '관전하기';

        if (state !== result)
            setState(result);
        if (props.info.password){
            return <div key={k} className="btn btn-outline-dark" onClick={()=>handleEnterGameRoom()}>{content}</div>
        }else{
            return <div key={k} className="btn btn-outline-dark" data-toggle='modal' data-target='#inputPwdModal'>{content}</div>
        }
    }

    return (
        <div className="col-6 m-0 p-2" key={`${props.info.roomid}gamebox`}>
            <div key={`${props.info.roomid}gameBoxBorder`} className="border p-3">
                <div key={`${props.info.roomid}gameBoxFirstRow`} className="row p-1">
                    <div key={`${props.info.roomid}BoxInfo`} className="col align-items-start">{props.info.title}</div>
                    <i key={`${props.info.roomid}BoxLock`} className="col-2 bi bi-lock"></i>
                </div>
                <div key={`${props.info.roomid}BoxButtonRow`} className="d-flex">
                    <div key={`${props.info.roomid}BoxWatchingBlock`} className="col mx-2">
                        <div key={`${props.info.roomid}BoxWatchingPeople`}>{`${props.info.observer}/5`}</div>
                        {()=>handlePwd(false)}
                        {/* 수정 필요!!!! */}
                    </div>
                    <div key={`${props.info.roomid}BoxPlayingBlock`} className="col mx-2">
                        <div key={`${props.info.roomid}BoxPlayingPeople`}>{`${props.info.observer}/2`}</div>
                        {/* <div key={`${props.info.roomid}BoxPlaying`} className="btn btn-outline-dark" onClick={()=>handleEnterGameRoom(true)}>게임하기</div> */}
                        {()=>handlePwd(true)}
                    </div>
                </div>
            </div>
            <InputPwdModal id={props.info.roomid} setPwd={setPwd}></InputPwdModal>
        </div>
    );
}