import {User} from "../context/userContext"

const userState:User = { userid: "", nickname: "", win: 0, lose: 0, profile: 0, level: "", levelpoint: 0,
	levelnextpoint: 0, friends: [], newfriends: [], blacklist: [], qrcode: "", history: [], twofactor: false };

const UPDATE:string = "user/UPDATE";

export const updateUser = (data:User) => ({type: UPDATE, payload: data});

export const userReducer = (state = userState, action: any) => {
  switch (action.type){
    case UPDATE:
      return action.payload ? action.payload : state;
    default:
      return state;
  }
};