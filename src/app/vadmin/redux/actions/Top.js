import Request from '../../util/request';
import * as types from '../constans/TopTypes';

const {
  ListServices,
  PublishService,
  CreateServiceWithResource: CreateService,
  UpdateService,
  ListApis,
  CreateApi,
  UpdateApi,
  PublishApi,
  ListServiceAccessKey,
  CreateServiceAccessKey,
  UpdateServiceAccessKey,
  DeleteServiceAccessKey,
  ListResourceType
} = Request;

export function getServices(reqObj) {
  return async (dispatch) => {
    const res = await ListServices(reqObj);
    dispatch(setServices(res));
  };
}

export function setServices(payload) {
  return {
    type: types.Set_Services,
    payload,
  };
}

export function editService(reqObj) {
  return async ()=>{
    await UpdateService(reqObj);
  };
}
export function createService(reqObj) {
  return async () => {
    await CreateService(reqObj);
  };
}
export function publishService(reqObj) {
  return async () => {
    await PublishService(reqObj);
  };
}

export function getApis(reqObj) {
  return async (dispatch) => {
    const res = await ListApis(reqObj);
    dispatch(setApis(res));
  };
}

export function setApis(payload) {
  return {
    type: types.Set_Apis,
    payload,
  };
}

export function editApi(reqObj) {
  return async ()=>{
    await UpdateApi(reqObj);
  };
}

export function addApi(reqObj) {
  return async ()=>{
    await CreateApi(reqObj);
  };
}

export function publishApi(reqObj) {
  return async ()=>{
    await PublishApi(reqObj);
  };
}

export function getAks(reqObj) {
  return async(dispatch) => {
    const {
      List = []
    } = await ListServiceAccessKey(reqObj);
    dispatch(setAks(List));
  };
}

export function setAks(list) {
  return {
    type: types.Set_AKs,
    payload: list,
  };
}

export function createAK(reqObj) {
  return async ()=>{
    return await CreateServiceAccessKey(reqObj);
  };
}

export function updateAK(reqObj) {
  return async ()=>{
    await UpdateServiceAccessKey(reqObj);
  };
}

export function deleteAK(reqObj) {
  return async ()=>{
    await DeleteServiceAccessKey(reqObj);
  };
}

export function getResourceTypes(reqObj) {
  return async(dispatch) => {
    const {
      List = []
    } = await ListResourceType(reqObj);
    dispatch(setResourceTypes(List));
  };
}

export function setResourceTypes(list) {
  return {
    type: types.Set_ResourceTypes,
    payload: list,
  };
}

export default {
  getServices,
  createService,
  publishService,
  editService,
  getApis,
  editApi,
  addApi,
  publishApi,
  getAks,
  createAK,
  updateAK,
  deleteAK,
  getResourceTypes
};