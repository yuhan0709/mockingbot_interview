import { post } from '../../util/byted/request';
import Log from '../../util/byted/log';
import getHost from '../../util/host';
import { isTCEProd } from '../../util/byted/env';
import { getRbacPermissionInfo } from '../public/user';
import { RBAC_APPS } from '../vadmin/request/util/constants';

const consoleDomain = isTCEProd ? 'https://vconsole.bytedance.net' : 'http://b-vconsole.bytedance.net';

export default async function (data, $curUser, $req, $res) {
  const { Identity, Id } = data;
  const host = await getHost.passport();
  const permissionError = { status: 'error', message: `暂无扮演用户 ${Identity} 的权限` };
  const permission = await getRbacPermissionInfo(RBAC_APPS.account.name, $curUser, $req, $res, true);
  const { super: superPermission = [] } = permission;
  const isBigSuper = superPermission.some(action => action === 'r') && superPermission.some(action => action === 'w');
  const hasPermission = isBigSuper || superPermission.some(action => +action === +Id);
  if (!hasPermission) return permissionError;
  try {
    const res = await post({
      url: `http://${host}/v2/account/super_login`,
      headers: { Authorization: 'Basic cGFzc3BvcnQ6ZDA1NjAyNWZiZWEzYzQ3MDA3MjljNWI5NmIwZmY5N2I=' },
      data: {
        Identity,
        UserName: $curUser.name
      }
    }, {}, $req, $res);
    if (res.Result && res.Result.LoginToken) {
      // 伪造有权限的Id进行登录
      if (res.Result.Account.Id !== Id) return permissionError;
      Log.info({
        logId: Log.genLogId($res),
        message: `[SuperLogin] UserName:${$curUser.name} Identity:${Identity} Id:${Id}`
      });
      return { status: 'success', url: `${consoleDomain}/tokenlogin?LoginToken=${encodeURIComponent(res.Result.LoginToken)}&innerUser=${encodeURIComponent(JSON.stringify($curUser))}` };
    }
    throw res;
  } catch (e) {
    Log.error({
      logId: Log.genLogId($res),
      message: `[SuperLogin] UserName:${$curUser.name} Identity:${Identity} Id:${Id} ${Log.getErrorString(e)}`
    });
    return { status: 'error', message: '角色扮演失败', body: e };
  }
}