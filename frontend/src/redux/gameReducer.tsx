import {gameRoomDetail, playRoom, draw, score} from '../types/gameTypes';

export const gameRoomInitialState:gameRoomDetail = { title: '', roomid: '', manager: '', speed: 0, observer: [],	type: '',	status: false, players: [], isPlayer: true }
export const playRoomInitialState:playRoom = { roomid: '',	score: 0, left: {userid: '', nickname: '', profile: 0}, right: {userid: '', nickname: '', profile: 0} };
export const gameResultInitialState:string = '';
export const drawInitialState:draw = { background: { width: 0, height: 0 }, ball: { x: 0, y: 0, r: 0 }, right: { x: 0, y: 0, width: 0, height: 0 }, left: { x: 0, y: 0, width: 0, height: 0 }};
export const scoreInitialState:score = { left: 0, right: 0 };

export const gameInitialState = {
  gameroom: gameRoomInitialState,
  playroom: playRoomInitialState,
  gameresult: gameResultInitialState,
  draw: drawInitialState,
  score: scoreInitialState
}

const GAMEROOMUPDATE:string = 'game/gameroom';
const PLAYROOMUPDATE:string = 'game/playroom';
const GAMERESULTUPDATE:string = 'game/result';
const DRAWUPDATE:string = 'game/draw';
const SCOREUPDATE:string = 'game/score';
const DELETE:string = 'DELETE';
// const UNDEFINED:string = 'UNDEFINED';
const DELETEGAME:string = 'DELETEGAME';

export const updateGameRoom = (data:gameRoomDetail) => ({type: GAMEROOMUPDATE, payload: data});
export const updatePlayRoom = (data:playRoom) => ({type: PLAYROOMUPDATE, payload: data});
export const updateGameResult = (data:string) => ({type: GAMERESULTUPDATE, payload: data});
export const updateDraw = (data:draw) => ({type: DRAWUPDATE, payload: data});
export const updateScore = (data:score) => ({type: SCOREUPDATE, payload: data});
// export const undefinedList = () => ({type: UNDEFINED});
export const initializeGame = () => ({type: DELETEGAME, payload: gameInitialState});

export const gameReducer = (state = gameInitialState, action: any) => {
  switch (action.type){
    case GAMEROOMUPDATE:
      return {...state, gameroom: action.payload};
    case PLAYROOMUPDATE:
      return {...state, playroom: action.payload};
    case GAMERESULTUPDATE:
      return {...state, gameresult: action.payload};
    case DRAWUPDATE:
      return {...state, draw: action.payload};
    case SCOREUPDATE:
      return {...state, score: action.payload};
    case DELETEGAME:
      return gameInitialState;
    case DELETE:
      return gameInitialState;
    default:
      return state;
  }
}