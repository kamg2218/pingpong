import {ChatData, ChatHistory} from '../types/chatTypes';

export const chatRoomInitialState:ChatData = { order: [], chatroom: [] };
export const historyInitalState:ChatHistory = { chatid: '', list: [] };
export const publicRoomInitalState:ChatData = { order: [], chatroom: [] };
export const chatInitialState = { chatroom: chatRoomInitialState, history: historyInitalState, publicroom: publicRoomInitalState }

const CHATROOMUPDATE:string = 'chat/room';
const PUBLICUPDATE:string = 'chat/public';
const HISTORYUPDATE:string = 'chat/history';
const DELETE:string = 'DELETE';

export const updateChat = (data:ChatData) => ({type: CHATROOMUPDATE, payload: data});
export const updatePublic = (data:ChatData) => ({type: PUBLICUPDATE, payload: data});
export const updateHistory = (data:ChatHistory) => ({type: HISTORYUPDATE, payload: data});

export const chatReducer = (state = chatInitialState, action:any) => {
  switch(action.type){
    case CHATROOMUPDATE:
      return {...state, chatroom: action.payload};
    case HISTORYUPDATE:
      return {...state, history: action.payload};
    case PUBLICUPDATE:
      return {...state, publicroom: action.payload};
    case DELETE:
      return state;
    default:
      return state;
  }
}