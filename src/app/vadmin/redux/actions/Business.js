import Apis from '../../util/request';
import { Business as BusinessType } from './actionTypes';


function getBusinessList(reqObj) {
  return async function(dispatch) {
    const res = await Apis.ListBusiness(reqObj);
    dispatch(setBusinessList(res));
  };
}

function setBusinessList(payload) {
  return {
    type: BusinessType.SET_BUSINESS_LIST,
    payload
  };
}

export default {
  setBusinessList,
  getBusinessList
};