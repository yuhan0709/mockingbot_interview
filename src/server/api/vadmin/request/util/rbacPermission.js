// 鉴权函数集合
import metrics from '../../../../util/byted/metrics';
import Log from '../../../../util/byted/log';
import { RBAC_APPS } from './constants';
import { getRbacPermissionInfo } from '../../../public/user';
import { PERMISSIONTIPS } from './constants';
import getConfigs from '../../../public/publicConfig';

export function stdActionPermission(apiConfig, Actions = [], Action) {
  const actionMap = {};
  Actions.forEach(action => {
    actionMap[action] = true;
  });
  const { method = 'get' } = apiConfig;
  if (method.match('post') && actionMap.w) return true;
  if (method === 'get' && actionMap.r) return true;
  if (actionMap[Action]) return true;
  return false;
}

export function _hasRWPermission(Actions = []) {
  return Actions.filter(action => (action === 'r' || action === 'w')).length >= 2;
}
const expenseServicePermission = async function (resource, reqObj, apiConfig, Action, permission, $res) {
  const {
    Service,
    Services,
    ProductGroupId,
    ProductGroups,
  } = reqObj;
  const servicesList = Services ? Services.split(',') : (Service ? [Service] : []);
  if (ProductGroupId || ProductGroups) {
    const { expenseConfig } = await getConfigs();
    const groupIds = typeof ProductGroups === 'string' ? ProductGroups.split(',') : [];
    if (ProductGroupId) groupIds.push(ProductGroupId);
    if (expenseConfig.ServiceOfProductGroup) {
      groupIds.forEach(pGroupId => {
        const serviceOfGroup = expenseConfig.ServiceOfProductGroup[pGroupId];
        if (serviceOfGroup) {
          servicesList.push(serviceOfGroup);
        }
      });
    }
  }
  // 针对Service/Services的请求
  if (servicesList.length > 0) {
    return servicesList.reduce((bool, service) => bool && stdActionPermission(apiConfig, permission[`${resource}_${service}`], Action), true);
  }
  // 其余请求暂时通过 之后根据参数进行校验
  const hasPermission = Object.keys(permission).filter(pkey => pkey.startsWith(resource)).reduce((bool, pkey) => {
    return bool && stdActionPermission(apiConfig, permission[pkey], Action);
  }, true);
  if (hasPermission) {
    Log.error({
      logId: Log.genLogId($res),
      message: `[Expense Service Permission] Api No ServiceInfo Action: ${Action} reqObj: ${JSON.stringify(reqObj)}`
    }, {
      noSliceMessage: true
    });
  }
  return hasPermission;
};

export const permissionFunc = {
  async DeveloperPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.public.name, $curUser, $req, $res);
    const { developer = [] } = permission;
    return stdActionPermission(apiConfig, developer, Action);
  },
  async APermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.public.name, $curUser, $req, $res);
    const { admin = [] } = permission;
    return stdActionPermission(apiConfig, admin, Action);
  },
  async MDocOPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const { BusinessID } = reqObj;
    const permission = await getRbacPermissionInfo(RBAC_APPS.doc.name, $curUser, $req, $res);
    return (stdActionPermission(apiConfig, permission.admin, Action)
      || stdActionPermission(apiConfig, permission[`doc_${BusinessID}`], Action));
  },
  async DocEPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const { BusinessID } = reqObj;
    const permission = await getRbacPermissionInfo(RBAC_APPS.doc.name, $curUser, $req, $res);
    const Actions = permission[`doc_${BusinessID}`];
    const actionMap = {};
    Actions.forEach(action => {
      actionMap[action] = true;
    });
    const { method = 'get' } = reqObj;
    return (
      (method === 'post' && actionMap.w) ||
      (method === 'get' && actionMap.r) ||
      actionMap[Action] ||
      actionMap.edit
    );
  },
  async MTopOPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const { ServiceId, BusinessID } = reqObj;
    const Id = ServiceId || BusinessID;
    const permission = await getRbacPermissionInfo(RBAC_APPS.top.name, $curUser, $req, $res);
    return (stdActionPermission(apiConfig, permission.admin, Action)
      || stdActionPermission(apiConfig, permission[`top_${Id}`], Action));
  },
  async DocManagerPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.doc.name, $curUser, $req, $res);
    return permission;
  },
  async TopManagerPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.top.name, $curUser, $req, $res);
    return permission;
  },
  async ExpensePermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.expense.name, $curUser, $req, $res);
    return stdActionPermission(apiConfig, permission.admin, Action);
  },
  async ExpenseCostPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.expense.name, $curUser, $req, $res);
    return stdActionPermission(apiConfig, permission.admin, Action) || stdActionPermission(apiConfig, permission.cost, Action);
  },
  async ExpenseCostVodPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.expense.name, $curUser, $req, $res);
    return stdActionPermission(apiConfig, permission['cost_vod'], Action) || stdActionPermission(apiConfig, permission.cost, Action);
  },
  async ExpenseCostLivePermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.expense.name, $curUser, $req, $res);
    return stdActionPermission(apiConfig, permission['cost_live'], Action) || stdActionPermission(apiConfig, permission.cost, Action);
  },
  async ExpenseInstancePermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.expense.name, $curUser, $req, $res);
    return stdActionPermission(apiConfig, permission.admin, Action) || stdActionPermission(apiConfig, permission.instance, Action)
      || (await expenseServicePermission('instance', reqObj, apiConfig, Action, permission, $res));
  },
  async ExpenseOrderPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.expense.name, $curUser, $req, $res);
    // 对于接口账单权限高于订单权限存在
    return stdActionPermission(apiConfig, permission.admin, Action) || stdActionPermission(apiConfig, permission.order, Action) || stdActionPermission(apiConfig, permission.bill, Action)
      || (await expenseServicePermission('order', reqObj, apiConfig, Action, permission, $res));
  },
  async ExpenseBillPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.expense.name, $curUser, $req, $res);
    return stdActionPermission(apiConfig, permission.admin, Action) || stdActionPermission(apiConfig, permission.bill, Action)
      || (await expenseServicePermission('bill', reqObj, apiConfig, Action, permission, $res));
  },
  async ExpenseProductPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.expense.name, $curUser, $req, $res);
    return stdActionPermission(apiConfig, permission.admin, Action) || stdActionPermission(apiConfig, permission.product, Action)
      || (await expenseServicePermission('product', reqObj, apiConfig, Action, permission, $res));
  },
  async AccountPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.account.name, $curUser, $req, $res);
    return stdActionPermission(apiConfig, permission.admin, Action);
  },
  async OPSAdminPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.ops.name, $curUser, $req, $res);
    return stdActionPermission(apiConfig, permission.admin, Action);
  },
  async OPSIAMPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res) {
    const permission = await getRbacPermissionInfo(RBAC_APPS.ops.name, $curUser, $req, $res);
    return stdActionPermission(apiConfig, permission.admin, Action) || stdActionPermission(apiConfig, permission.iam, Action);
  },
};

async function _checkPermission(reqObj = {}, permission, func, apiConfig, Action, $curUser, $req, $res) {
  if (permission) {
    const logId = Log.genLogId($res);
    if (permissionFunc[permission] && typeof permissionFunc[permission] === 'function') {
      // 校验开发者权限
      const isDeveloper = await permissionFunc.DeveloperPermissionApis(reqObj, apiConfig, Action, $curUser, $req, $res);
      if (!isDeveloper) {
        const hasPermission = await permissionFunc[permission](reqObj, apiConfig, Action, $curUser, $req, $res);
        if (!hasPermission) {
          const errorMessage = PERMISSIONTIPS[permission] || '暂无权限';
          metrics.emitCounter('checkpermission.error', 1, undefined, { type: errorMessage.replace(/\W/, '').toLowerCase() });
          Log.error({
            logId,
            message: `${errorMessage} user: ${JSON.stringify($curUser)} ${permission} ${JSON.stringify(reqObj)}`
          });
          return { status: 'error', message: errorMessage };
        }
      }
    } else {
      Log.error({
        logId,
        message: `permission: ${permission} has no permission function`
      });
      return { status: 'error', message: '暂无权限' };
    }
  }
  return func(reqObj, $curUser);
}

export default function checkPermission(func, apiConfig, Action) {
  const permissions = Array.isArray(apiConfig.permission) ? apiConfig.permission : [apiConfig.permission];
  return async function (reqObj = {}, $curUser, $req, $res) {
    const errorOut = { status: 'error', messageList: [] };
    for (const permission of permissions) {
      const res = await _checkPermission(reqObj, permission, func, apiConfig, Action, $curUser, $req, $res);
      if (res.status !== 'error') {
        return res;
      }
      errorOut.messageList.push(res.message);
    }
    errorOut.message = errorOut.messageList.join(';');
    return errorOut;
  };
}