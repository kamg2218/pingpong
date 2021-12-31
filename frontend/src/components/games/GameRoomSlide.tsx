import { useEffect, useState } from 'react';
import { gameRoom, gameRoomList } from '../../socket/gameSocket'
import GameBox from './GameBox'

export default function GameRoomSlide(props: any){
    const [idx, setIdx] = useState<number>(0);
    let list: Array<gameRoom> = gameRoomList;

    const handleButton = (num: number) => {
        if (num === 1 && (idx + 1) * 6 < list.length){
            setIdx(idx + 1);
        }else if (num === -1 && idx > 0){
            setIdx(idx - 1);
        }
    }
    const handleCarouselItem = () => {
        let i:number = idx * 6;
        let carousel = [];
        
        for (;i < list.length; i++){
            if (i >= (idx * 6) + 6)
                break ;
            carousel.push(<GameBox key={`${list[i].roomid}box`} info={list[i]}></GameBox>);
        }
        return carousel;
    }
    const handleSearchItem = () => {
        const searchRoom = gameRoomList.filter(room => room.title.indexOf(props.search) !== -1);
        list = searchRoom;
        return handleCarouselItem();
    }

    return (
        <div key="gameRoomSlide" className="container">
            <div key="slideFirstCol" className="col">
                <div key="slide1Row" className="row mx-1">
                    {props.search === "" ? handleCarouselItem() : handleSearchItem()}
                </div>
                <div key="slide2Row" className="row d-flex justify-content-center my-3">
                    <span key="slidePrev" className="carousel-control-prev-icon shadow mx-5 my-2" aria-hidden="true" onClick={()=>handleButton(-1)}></span>
                    <span key="slideNext" className="carousel-control-next-icon shadow mx-5 my-2" aria-hidden="true" onClick={()=>handleButton(1)}></span>
                </div>
            </div>
        </div>
    );
}