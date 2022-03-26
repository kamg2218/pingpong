import { connect } from "react-redux";
import {ChatData, ChatHistory} from "../context/chatContext"

const chatRoomInitialState:ChatData = { order: [], chatroom: [] };
const historyInitalState:ChatHistory = { chatid: "", list: [] };
const publicRoomInitalState:ChatData = { order: [], chatroom: [] };

const chatInitialState = {
  chatroom: chatRoomInitialState,
  history: historyInitalState,
  publicroom: publicRoomInitalState
}

const CHATROOMUPDATE:string = "chat/room";
const PUBLICUPDATE:string = "chat/public";
const HISTORYUPDATE:string = "chat/history";

export const updateChat = (data:ChatData) => ({type: CHATROOMUPDATE, payload: data});
export const updatePublic = (data:ChatData) => ({type: PUBLICUPDATE, payload: data});
export const updateHistory = (data:ChatHistory) => ({type: HISTORYUPDATE, payload: data});

export const chatReducer = (state = chatInitialState, action:any) => {
  console.log(typeof action.payload);
  switch(action.type){
    case CHATROOMUPDATE:
      return {...state, chatroom: action.payload};
    case HISTORYUPDATE:
      return {...state, history: action.payload};
    case PUBLICUPDATE:
      return {...state, publicroom: action.payload};
    default:
      return state;
  }
}

// export const chatRoomReducer = (state = chatRoomInitialState, action: any) => {
//   console.log("chatRoomReducer");
//   switch (action.type){
//     case CHATROOMUPDATE:
//       return {...state, action.payload};
//     default:
//       return state;
//   }
// };
// export const publicRoomReducer = (state = publicRoomInitalState, action: any) => {
//   console.log("publicRoomReducer");
//   console.log(action.payload);
//   switch (action.type){
//     case PUBLICUPDATE:
//       return action.payload ? action.payload : state;
//     default:
//       return state;
//   }
// };
// export const chatHistoryReducer = (state = historyInitalState, action:any) => {
//   console.log("chatHistoryReducer");
//   console.log(action.payload);
//   switch (action.type){
//     case HISTORYUPDATE:
//       return action.payload ? action.payload : state;
//     default:
//       return state;
//   }
// };

// connect(updateChat)(chatRoomReducer);