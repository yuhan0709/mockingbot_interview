import { User as UserTypes } from '../actions/actionTypes';
import { combineReducers } from 'redux';

const defaultUser = {
  email: '',
  emails: [],
  employee_id: '',
  id: 0,
  name: '未登录',
  picture: '',
  username: '',
};
function Info(state = defaultUser, action) {
  switch (action.type) {
  case UserTypes.SET_USER:
    return action.payload;
  case UserTypes.CLEAR_USER:
    return defaultUser;
  default:
    return state;
  }
}

export default combineReducers({
  Info,
});
