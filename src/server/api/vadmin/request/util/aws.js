import methodMap from '../../../public/request';
import { checkPermission as checkRbacPermission, getAddress, nowUs, getVersion } from './index';
import Log from '../../../../util/byted/log';
import { GLOBAL_IS_MOCK, mockHost } from './constants';
import MSMetrics from '../../../../util/byted/msMetrics';
import Service from './topService';

export default function AWSApi(apiConfig, Action, ApiPathMap = {}) {
  const methodFunc = methodMap[apiConfig.method];
  let func = apiConfig.func;
  const callback = apiConfig.callback;
  if (Action !== 'GetEmployeePermission2')
    func = checkRbacPermission(func, apiConfig, Action);
  return async function (reqObj = {}, $curUser, $req, $res) {
    const logId = Log.genLogId($res);
    const bgTime = nowUs();

    const apiPath = ApiPathMap[Action] ? `${ ApiPathMap[Action] !== '/' ? '/' + ApiPathMap[Action] : '' }` : '';
    Log.info({
      logId,
      message: `Action:${Action} 接到请求`
    });
    const {
      isMock = GLOBAL_IS_MOCK
    } = reqObj;
    let obj = {}, config = {};
    const ret = await func(reqObj, $curUser, $req, $res);
    if (ret.status === 'error') return ret;
    if (Array.isArray(ret)) [obj, config] = ret;
    else obj = ret;
    const {
      data = {},
      query = {}
    } = obj;
    let url = '', cluster = '-';
    if (!isMock) {
      if (apiConfig.service === 'policy') {
        obj = obj || {};
        obj.query = obj.query || {
          ...obj
        };
        obj.query['X-Account-Id'] = 1;
        const serviceMethod = Service[Action];
        return (await serviceMethod(obj));
      }
      const address = await getAddress(apiConfig.service);
      const host = `http://${address.host}:${address.port}`;
      cluster = address.tags && address.tags.cluster || 'default';
      url = (host + apiPath);
    } else {
      url = `${mockHost}${apiPath}/${apiConfig.action ? apiConfig.action : Action}`;
    }
    Log.info({
      logId,
      message: `Action:${Action} 发起下游调用 ${url} ${Action} ${JSON.stringify(data)} ${JSON.stringify(query)}`
    });
    return methodFunc({
      url,
      headers: {
        Authorization: 'Basic Y21zOjU3MGQ5OWU0Yzg1OTE0NDcwZDkxNDE3MGQxZTk1MTQ0' // 之后换成用 base64 计算
      },
      timeout: 5000,
      ...obj,
      followAllRedirects: true,
      data,
      query: {
        Action: apiConfig.action ? apiConfig.action : Action,
        Version: getVersion(apiConfig.service),
        ...query
      }
    }, { logCluster: cluster, ...config }, $req, $res).then((res) => {
      const duration = (nowUs() - bgTime);
      if (res.status === 'error') {
        MSMetrics.api.error(Action);
        Log.error({
          logId,
          message: `Action:${Action} 下游调用错误 ${duration} ${Log.getErrorString(res)}`
        });
      } else {
        Log.info({
          logId,
          message: `Action:${Action} 下游调用返回 ${duration} ${JSON.stringify(res)}`
        });
        MSMetrics.api.success(Action, duration);
      }
      try {
        if (callback) {
          return callback(res, $req, $res);
        }
      } catch (e) {
        console.log(e);
      }
      return res;
    }).catch(e => {
      const duration = (nowUs() - bgTime);
      Log.error({
        logId,
        message: `Action:${Action} 下游调用错误 ${duration} ${Log.getErrorString(e)}`
      });
      MSMetrics.api.error(Action);
      return e;
    });
  };
}
