import Request from '../../util/request';
import * as types from '../constans/DocsTypes';
import AI from '../../../../server/api/ailab';

const {
  GetBusinessDocumentStructure,
  MultiPublishBusinessDocument,
  MultiOfflineBusinessDocument,
  AddBusinessDocument,
  UpdateBusinessDocument,
  DelBusinessDocument,
  UpdateBusinessDocumentIndex,
  GetLatestBusinessDocument,
  SaveBusinessDocument,
  PublishBusinessDocument,
  OfflineBusinessDocument,
  ListBusinessDocumentVersion,
  PublishBusinessDocumentVersion,
  GetBusinessDocumentVersion,
  GetBusinessManagers,
} = Request;
const {
  extractKeyWords
} = AI;

export function getDoc(DocumentID, BusinessID) {
  return async (dispatch) => {
    const res = await GetLatestBusinessDocument({
      DocumentID, BusinessID
    });
    const {
      Content = '',
      Keywords = ''
    } = res;
    dispatch(setDoc(Content));
    dispatch(setDocKeyWords(Keywords));
  };
}

export function getDocForVersion(DocumentID, VersionID, BusinessID) {
  return async (dispatch) => {
    const res = await GetBusinessDocumentVersion({ DocumentID, VersionID, BusinessID });
    const {
      Content = '',
      Keywords = ''
    } = res;
    dispatch(setDoc(Content));
    dispatch(setDocKeyWords(Keywords));
  };
}

export function setDoc(payload) {
  return {
    type: types.Set_Doc,
    payload,
  };
}

export function setDocKeyWords(payload) {
  return {
    type: types.Set_DocKeyWords,
    payload,
  };
}

export function getDocCategory(BusinessID) {
  return async (dispatch) => {
    const res = await GetBusinessDocumentStructure({
      BusinessID
    });
    const {
      List = [],
      Business = {}
    } = res;
    dispatch(setDocCategory(List));
    Business.Managers = [];
    try {
      Business.Managers = await GetBusinessManagers({
        BusinessName: Business.Name
      });
    } catch (e) {
      console.log(e);
    }
    dispatch(setDocBusiness(Business));
  };
}

export function setDocCategory(payload) {
  return {
    type: types.Set_Category,
    payload,
  };
}

export function setDocBusiness(payload) {
  return {
    type: types.Set_Business,
    payload,
  };
}

export function publishMultiDoc(DocumentIDs, BusinessID) {
  return async () => {
    await MultiPublishBusinessDocument({
      DocumentIDs, BusinessID
    });
  };
}

export function offlineMultiDoc(DocumentIDs, BusinessID) {
  return async () => {
    await MultiOfflineBusinessDocument({
      DocumentIDs, BusinessID
    });
  };
}

export function addDoc(reqObj) {
  return async () => {
    await AddBusinessDocument(reqObj);
  };
}

export function updateDoc(DocumentID, ParentID, Title, MainPage, KeyWords, BusinessID, Scope) {
  return async (dispatch) => {
    const res = await UpdateBusinessDocument({
      DocumentID, ParentID, Title, MainPage, KeyWords, BusinessID, Scope
    });
    dispatch(updateDocCategory(res));
  };
}

export function updateDocCategory(payload) {
  return {
    type: types.Update_Category,
    payload,
  };
}

export function deleteDoc(DocumentID, BusinessID) {
  return async () => {
    await DelBusinessDocument({ DocumentID, BusinessID });
  };
}

export function adjustDoc(List, BusinessID) {
  return async () => {
    await UpdateBusinessDocumentIndex({ List, BusinessID });
  };
}

export function saveDoc(DocumentID,Title, Content, KeyWords, BusinessID) {
  return async (dispatch) => {
    if (KeyWords === '') {
      // 提取关键词
      try {
        const { body } = await extractKeyWords({ gid: 6596521417209020931, req_type: 'TEXT', title: Title,content: Content, count: 5 });
        KeyWords = body.keyphrases.map(k => k.text);
      } catch (e) {
        KeyWords = Title;
        console.error(e);
      }
    }
    // console.log('KeyWords',KeyWords);
    const res = await SaveBusinessDocument({ DocumentID, Keywords: KeyWords, Content, BusinessID });
    dispatch(setDoc(res.Content || ''));
    dispatch(setDocKeyWords(res.Keywords || ''));
  };
}

export function publishDoc(DocumentID, BusinessID) {
  return async () => {
    await PublishBusinessDocument({ DocumentID, BusinessID });
  };
}

export function offlineDoc(DocumentID, BusinessID) {
  return async () => {
    await OfflineBusinessDocument({ DocumentID, BusinessID });
  };
}

export function getDocVersionList(DocumentID, BusinessID, Limit = 10, Offset = 0) {
  return async (dispatch) => {
    const res = await ListBusinessDocumentVersion({
      DocumentID, Limit, Offset, BusinessID
    });
    dispatch(setDocVersionList(res));
  };
}

export function setDocVersionList(payload) {
  return {
    type: types.Set_DocVersionList,
    payload,
  };
}

export function publishDocForVersion(DocumentID, VersionID, BusinessID) {
  return async () => {
    await PublishBusinessDocumentVersion({ DocumentID, VersionID, BusinessID });
  };
}

export default {
  getDoc,
  getDocCategory,
  publishMultiDoc,
  offlineMultiDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  adjustDoc,
  saveDoc,
  publishDoc,
  offlineDoc,
  getDocVersionList,
  getDocForVersion,
  publishDocForVersion
};