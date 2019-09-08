import * as actionTypes from './actionTypes';

export const setUser = user => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser: user
    }
  };
};

export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER
  }
};

//group actions
export const setCurrentGroup = group => {
  return {
    type: actionTypes.SET_CURRENT_GROUP,
    payload: {
      currentGroup: group
    }
  }
};

export const setPrivateGroup = isPrivateGroup => {
  return {
    type: actionTypes.SET_PRIVATE_GROUP,
    payload: {
      isPrivateGroup: isPrivateGroup
    }
  }
};

//user post actions
export const setUserPosts = userPosts => {
  return {
    type: actionTypes.SET_USER_POSTS,
    payload: {
      userPosts: userPosts
    }
  }
};

//theme color
export const setColors = (primaryColor, secondaryColor) => {
  return {
    type: actionTypes.SET_COLORS,
    payload: {
      primaryColor,
      secondaryColor
    }
  }
};
