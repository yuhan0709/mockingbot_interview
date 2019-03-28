import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import apiData from './ApiData';
import User from './User';
import Docs from './Docs';
import Business from './Business';
import Top from './Top';

const rootReducer = combineReducers({
  router,
  apiData,
  User,
  Docs,
  Business,
  Top,
});

export default rootReducer;
