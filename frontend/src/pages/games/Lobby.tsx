import {useState} from 'react'
import GameRoomSlide from '../../components/games/GameRoomSlide'

export default function Lobby(){
    const [search, setSearch] = useState<String>("");

    const handleSearch = (event:any) => {
        setSearch(event.target.value);
    }

    return (
        <div className="container my-4 mx-2 px-2 h-100 border">
            <div className="row">
                <div className="col-10">
                    <div className="row-2 d-flex justify-content-start mx-1 my-2">
                        <i className="bi bi-search mx-3"></i>
                        <input className="w-50" onChange={handleSearch}></input>
                    </div>
                    <div className="row">
                        <GameRoomSlide search={search}></GameRoomSlide>
                    </div>
                </div>
                <div className="col-2 my-5">
                    <div className="row my-3 mx-1">
                        <button className="btn btn-outline-dark"><i className="bi bi-plus-circle"></i> 방 만들기</button>
                    </div>
                    <div className="row my-3 mx-1">
                        <button className="btn btn-outline-dark"><i className="bi bi-controller"></i> 랜덤 매칭</button>
                    </div>
                </div>
            </div>
        </div>
    );
}