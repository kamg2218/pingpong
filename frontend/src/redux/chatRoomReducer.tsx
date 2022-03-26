import {ChatData} from "../context/chatContext"

const chatRoomInitialState:ChatData = { order: [], chatroom: [] };

const CHATROOMUPDATE:string = "chat/room";

export const updateChat = (data:ChatData) => ({type: CHATROOMUPDATE, payload: data});

export const chatRoomReducer = (state = chatRoomInitialState, action: any) => {
  console.log("chatRoomReducer");
  console.log(action.payload);
  switch (action.type){
    case CHATROOMUPDATE:
      return action.payload;
    default:
      return state;
  }
};