import { AWSApi } from './util';
import account from './apis/account';
import document from './apis/document';
import permission from './apis/permission';
import topAdmin from './apis/topAdmin';
import billing from './apis/billing';
import instance from './apis/instance';
import productGroup from './apis/productGroup';
import product from './apis/product';
import spec from './apis/spec';
import constApi from './apis/const';
import bill from './apis/bill';
import order from './apis/order';
import apis from './apis/index';
import app from './apis/app';
import manager from './apis/manager';
import resource from './apis/resource';
import statistics from './apis/statistics';
import enhanceApi from './enhance';
import group from './apis/group';
import policy from './apis/policy';
import mysqlApis from './apis/mysql';


// 各组 API 映射 path 的哈希表
const ApiMap = {
  account,
  permission,
  document,
  top_admin: topAdmin,
  billing_method: billing,
  instance,
  'const': constApi,
  bill: bill,
  order: order,
  product_group: productGroup,
  product,
  spec,
  '/': apis,
  app,
  resource,
  statistics,
  group,
  manager,
  'policy': policy,
};

const ApiPathMap = {};
let Apis = {};

Object.keys(ApiMap).forEach(path => {
  Object.keys(ApiMap[path]).forEach(Action => {

    const resObj = ApiMap[path][Action];
    if (!resObj.method) {
      resObj.method = 'get';
    }
    if (!resObj.func) {
      const key = resObj.method === 'get' ? 'query' : 'data';
      // rbac service force add param 'Email' from curUser
      if (resObj.service === 'rbac') {
        resObj.func = function (param = {}, $curUser) {
          const res = {};
          param.Email = $curUser.email;
          res[key] = param;
          return res;
        };
      } else {
        resObj.func = function (param = {}) {
          const res = {};
          res[key] = param;
          return res;
        };
      }
    }
    ApiPathMap[Action] = path;
    Apis[Action] = AWSApi(resObj, Action, ApiPathMap);
  });
});

Apis = {
  ...Apis,
  ...mysqlApis,
};

// 粘合 API
enhanceApi(Apis);

export const exec = function (key, reqObj = {}, $curUser, $req, $res) {
  return Apis[key](reqObj, $curUser, $req, $res);
};

export default Apis;
