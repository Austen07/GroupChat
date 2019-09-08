import {combineReducers} from 'redux';

import * as actionTypes from '../actions/actionTypes';


const initialUserState = {
  currentUser: null,
  isLoading: true
}

const user_reducer = (state = initialUserState, action) => {
  switch(action.type) {
    case actionTypes.SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isLoading: false
      }
    case actionTypes.CLEAR_USER:
      return {
        ...state,
        isLoading: false
      }
    default:
      return state;
  }
}


//group reducer
const initialGroupState = {
  currentGroup: null,
  isPrivateGroup: false,
  userPosts: null
};

const group_reducer = (state=initialGroupState, action) => {
  switch(action.type) {
    case actionTypes.SET_CURRENT_GROUP:
      return {
        ...state,
        currentGroup: action.payload.currentGroup
      }
    case actionTypes.SET_PRIVATE_GROUP:
      return {
        ...state,
        isPrivateGroup: action.payload.isPrivateGroup
      }
    case actionTypes.SET_USER_POSTS:
      return {
        ...state,
        userPosts: action.payload.userPosts
      };
    default:
      return state;
  }
}


//color reducer
const initialColorState = {
  primaryColor: '#7d9c72',
  secondaryColor: '#eee'
};

const color_reducer = (state=initialColorState, action) => {
  switch(action.type) {
    case actionTypes.SET_COLORS:
      return {
        primaryColor: action.payload.primaryColor,
        secondaryColor: action.payload.secondaryColor
      }
    default:
      return state;
  }
}




const rootReducer = combineReducers ({
  user: user_reducer,
  group: group_reducer,
  colors: color_reducer
});

export default rootReducer;