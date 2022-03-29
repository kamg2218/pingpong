import {gameRoom, gameRoomDetail, playRoom, draw} from "../types/gameTypes"

export const gameRoomInitialState:gameRoomDetail = { title: "", roomid: "", manager: "", speed: 0, observer: [],	type: "",	status: false, players: [], isPlayer: true }
export const playRoomInitialState:playRoom = { roomid: "",	score: 0, player1: "", player2: "" };
export const gameResultInitialState:string = "";
export const drawInitialState:draw = { background: { width: 0, height: 0 }, ball: { x: 0, y: 0, r: 0 }, right: { x: 0, y: 0, width: 0, height: 0, score: 0	}, left: { x: 0, y: 0, width: 0, height: 0, score: 0 }};

export const gameInitialState = {
  gameroom: gameRoomInitialState,
  playroom: playRoomInitialState,
  gameresult: gameRoomInitialState,
  draw: drawInitialState
}

const GAMEROOMUPDATE:string = "game/gameroom";
const PLAYROOMUPDATE:string = "game/playroom";
const GAMERESULTUPDATE:string = "game/result";
const DRAWUPDATE:string = "game/draw";
const DELETE:string = "DELETE";
const UNDEFINED:string = "UNDEFINED";

export const updateGameRoom = (data:gameRoomDetail) => ({type: GAMEROOMUPDATE, payload: data});
export const updatePlayRoom = (data:playRoom) => ({type: PLAYROOMUPDATE, payload: data});
export const updateGameResult = (data:string) => ({type: GAMERESULTUPDATE, payload: data});
export const updateDraw = (data:draw) => ({type: DRAWUPDATE, payload: data});
export const undefinedList = () => ({type: UNDEFINED});

export const gameReducer = (state = gameInitialState, action: any) => {
  // console.log(typeof action.payload);
  // console.log(action.type);
  switch (action.type){
    case GAMEROOMUPDATE:
      return {...state, gameroom: action.payload};
    case PLAYROOMUPDATE:
      return {...state, playroom: action.payload};
    case GAMERESULTUPDATE:
      return {...state, gameresult: action.payload};
    case DRAWUPDATE:
      return {...state, draw: action.payload};
    case DELETE:
      return gameInitialState;
    default:
      return state;
  }
}