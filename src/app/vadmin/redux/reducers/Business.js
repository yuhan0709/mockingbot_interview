import { Business as BusinessType } from '../actions/actionTypes';

function Business(state = {}, action) {
  switch (action.type) {
  case BusinessType.SET_BUSINESS_LIST:
    return action.payload;
  case BusinessType.CLEAR_BUSINESS_LIST:
    return [];
  default:
    return state;
  }
}

export default Business;