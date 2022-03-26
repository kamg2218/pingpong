const initialState = {
  data: [],
};

export const rootReducer = (state = initialState, action:any) => {
  switch (action.type){
    case "SET_DOGS":
      return { ...state, data: action.payload};
    default:
      return state;
  }
};