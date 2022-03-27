import {User} from "../types/userTypes"

export const userInitial:User = { userid: "", nickname: "", win: 0, lose: 0, profile: 0, level: "", levelpoint: 0,
	levelnextpoint: 0, friends: [], newfriends: [], blacklist: [], qrcode: "", history: [], twofactor: false };

export const userState = { user: userInitial };

const UPDATE:string = "user/UPDATE";
const DELETE:string = "DELETE";

export const updateUser = (data:User) => ({type: UPDATE, payload: data});
export const initialize = () => ({type: DELETE});

export const userReducer = (state = userState, action: any) => {
  // console.log(action.type);
  switch (action.type){
    case UPDATE:
      return {...state, user: action.payload};
    case DELETE:
      return userState;
    default:
      return state;
  }
};