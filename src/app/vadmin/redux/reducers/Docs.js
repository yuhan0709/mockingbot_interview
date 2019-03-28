import { combineReducers } from 'redux';
import { defaultDocCategory,defaultVersionList } from '../constans/Docs';
import * as types from '../constans/DocsTypes';
import treeUtil from '../../util/tree';

const lineToTree = treeUtil.lineToTree;

function Business(state = {},action) {
  switch (action.type) {
  case 'DOC_Business_CLEAR':
    return {};
  case types.Set_Business:
    return action.payload;
  default:
    return state;
  }
}

function Category(state = defaultDocCategory, action) {
  switch (action.type) {
  case 'DOC_CATEGORY_CLEAR':
    return defaultDocCategory;
  case types.Set_Category:
    return genCategory(action.payload);
  case types.Add_Category:
    return genCategory([].concat(state.line, [action.payload]));
  case types.Update_Category: {
    let data = [...state.line];
    let index = data.findIndex(e => e.DocumentID === action.payload.DocumentID);
    data.splice(index, 1, action.payload);
    return genCategory(data);
  }
  default:
    return state;
  }
}

function DocContent(state = '',action) {
  switch (action.type) {
  case 'DOC_CONTENT_CLEAR':
    return '';
  case types.Set_Doc:
    return action.payload;
  default:
    return state;
  }
}

function DocKeyWords(state = '',action) {
  switch (action.type) {
  case 'DOC_KeyWords_CLEAR':
    return '';
  case types.Set_DocKeyWords:
    return action.payload;
  default:
    return state;
  }
}

function VersionList(state = defaultVersionList,action) {
  switch (action.type) {
  case 'VERSION_LIST_CLEAR':
    return defaultVersionList;
  case types.Set_DocVersionList:
    return action.payload;
  default:
    return state;
  }
}

function genCategory(data = []) {
  return {
    line: data,
    tree: lineToTree(data),
  };
}

export default combineReducers({
  Category,
  DocContent,
  DocKeyWords,
  VersionList,
  Business
});