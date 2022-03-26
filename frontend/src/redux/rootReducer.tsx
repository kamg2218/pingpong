import {combineReducers} from "redux"
import {userReducer} from "./userReducer"
import {gameReducer} from "./gameReducer"
import {chatReducer} from "./chatReducer"
import storage from 'redux-persist/lib/storage';
import storageSession from 'redux-persist/lib/storage/session';
import {persistReducer} from "redux-persist";

// import {chatRoomReducer} from "./chatRoomReducer"

const persistConfig = {
  key: "root",
  storage: storage,
};

const rootReducer = combineReducers({
  userReducer,
  chatReducer,
  // chatRoomReducer,
  // publicRoomReducer,
  // chatHistoryReducer,
  gameReducer
  // gameRoomReducer,
  // roomListReducer,
  // gameResultReducer,
  // playRoomReducer,
  // drawReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default persistReducer(persistConfig, rootReducer);