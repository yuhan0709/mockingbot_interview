import * as types from '../constans/TopTypes';
import { combineReducers } from 'redux';

function Services(state = {}, action) {
  switch (action.type) {
  case types.Set_Services:
    return action.payload;
  case types.Clear_Services:
    return {};
  default:
    return state;
  }
}

function Apis(state = {}, action) {
  switch (action.type) {
  case types.Set_Apis:
    if (action.payload.List){
      action.payload.List.forEach(api=>{
        const { IsInner,IsAuth,Timeout } = api.ApiPermission;
        api.IsInner = IsInner;
        api.IsAuth = IsAuth;
        api.Timeout = Timeout;
      });
    }
    return action.payload;
  case types.Clear_Apis:
    return {};
  default:
    return state;
  }
}

function AccessKeys(state = [], action) {
  switch (action.type) {
  case types.Set_AKs:
    return action.payload;
  case types.Clear_AKs:
    return [];
  default:
    return state;
  }
}

function ResouceTypes(state = [], action) {
  switch (action.type) {
  case types.Set_ResourceTypes:
    return action.payload;
  default:
    return state;
  }
}

export default combineReducers({
  Services,
  Apis,
  AccessKeys,
  ResouceTypes
});