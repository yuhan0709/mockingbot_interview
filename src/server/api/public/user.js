import Apis from '../vadmin/request/index';
// import metrics from '../../util/byted/metrics';
import RedisGroup from '../../util/redisGroup';
// import Log from '../../util/byted/log';
import { RBAC_APPS } from '../vadmin/request/util/constants';
import { _hasRWPermission } from '../vadmin/request/util/rbacPermission';

const project = process.env.VPROJCET;
// const bgCounter = 'getpermission.begin';
// const normalGetCounter = 'getpermission.get';
// const redisGetCounter = 'getpermission.redis';
// const errCounter = 'getpermission.error';

export async function getCurUser($curUser){
  return $curUser;
}

// 过渡阶段 获取同样的数据结构
export async function getUserPermissionInfo($curUser, $req, $res) {
  const res = await Promise.all([
    getRbacPermissionInfo(RBAC_APPS.public.name, $curUser, $req, $res, true),
    getRbacPermissionInfo(RBAC_APPS.doc.name, $curUser, $req, $res, true),
    getRbacPermissionInfo(RBAC_APPS.top.name, $curUser, $req, $res, true)
  ]);
  let Admin = false;
  if (res[0] && res[0].admin) {
    Admin = _hasRWPermission(res[0].admin);
  }
  const Manager = [],
    DocOperator = [],
    TopOperator = [];
  if (res[1]) {
    Object.keys(res[1]).forEach(key => {
      if (!_hasRWPermission(res[1][key])) return;
      else if (key.match(/doc_\d+/g)) {
        DocOperator.push(+key.split('_')[1]);
      }
    });
  }
  if (res[2]) {
    Object.keys(res[2]).forEach(key => {
      if (!_hasRWPermission(res[2][key])) return;
      else if (key.match(/top_\d+/g)) {
        TopOperator.push(+key.split('_')[1]);
      }
    });
  }
  return {
    Admin,
    Manager,
    DocOperator,
    TopOperator
  };
}

export async function flushRbacPermissionInfo(AppName, $curUser, $req, $res) {
  try {
    const res = await Apis.GetEmployeePermission2({ AppName, EmployeeEmail: $curUser.email }, $curUser, $req, $res);
    if (res.Result) {
      // 同步新状态至redis
      RedisGroup.permission.set(`${project}_rbac_${AppName}_${$curUser.email}`, JSON.stringify(res.Result));
      return res.Result;
    }
  } catch (e) {
    console.log(e);
  }
  return {};
}
export async function getRbacPermissionInfo(AppName, $curUser, $req, $res, forceFlush = false) {
  if (forceFlush) return flushRbacPermissionInfo(AppName, $curUser, $req, $res);
  const result = await RedisGroup.permission.get(`${project}_rbac_${AppName}_${$curUser.email}`);
  if (result) {
    return JSON.parse(result);
  }
  return flushRbacPermissionInfo(AppName, $curUser, $req, $res);
}

export async function flushRbacManagerPermissionInfo(AppName, $curUser, $req, $res) {
  let isManager = await isAnyRbacManager($curUser, $req, $res, AppName);
  RedisGroup.permission.set(`${project}_rbac_manager_${AppName}_${$curUser.email}`, JSON.stringify(isManager));
  return isManager;
}
export async function getRbacManagerPermissionInfo(AppName, $curUser, $req, $res, forceFlush = false) {
  if (forceFlush) return flushRbacManagerPermissionInfo(AppName, $curUser, $req, $res);
  const result = await RedisGroup.permission.get(`${project}_rbac_manager_${AppName}_${$curUser.email}`);
  if (result) {
    return JSON.parse(result);
  }
  return flushRbacManagerPermissionInfo(AppName, $curUser, $req, $res);
}
export async function isAnyRbacManager($curUser, $req, $res, AppName) {
  try {
    const res = await Apis.ListApp({ Limit: 1 }, $curUser, $req, $res);
    if (res.Result) {
      if (!AppName) if (AppName) return true;
      else {
        return res.Result.List.filter(app => app.Name === AppName);
      }
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}

export async function getAllAppPermission($curUser, $req, $res) {
  const permissionMap = {};
  await Promise.all(Object.keys(RBAC_APPS).map(async appKey => {
    const permission = await getRbacPermissionInfo(RBAC_APPS[appKey].name, $curUser, $req, $res, true);
    permissionMap[appKey] = permission;
  }));
  return permissionMap;
}