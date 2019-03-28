import { getCurUser } from '../../../../server/api/public/user';
import { User } from './actionTypes';
export function setUser(user) {
  return {
    type: User.SET_USER,
    payload: user
  };
}

export function getUser() {
  return async (dispatch) => {
    const curUser = await getCurUser('$curUser');
    dispatch(setUser(curUser));
  };
}

export default {
  setUser,
  getUser,
};
