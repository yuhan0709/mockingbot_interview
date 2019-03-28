import nodeRequest from 'request';
import Log from './log';
import { getUs } from './msMetrics';

function promiseRequest(options) {
  return new Promise((resolve, reject) => {
    nodeRequest(options, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function checkLogBizError(logBizError, response) {
  if (typeof logBizError === 'function') {
    return logBizError(response);
  }
  return !!logBizError;
}

/**
 * request方法
 * @param {Object} reqObj 请求数据 query<Object>: queryString参数 data<Object>: form参数
 * @param {Object} reqObj.query queryString参数
 * @param {Object} reqObj.data form参数
 * @param {Object} requestConfig 请求配置
 * @param {Boolean} requestConfig.needHeaders 是否返回带headers的对象
 * @param {Boolean|Function} requestConfig.logBizError 控制是否打印业务error。可以为一函数，参数为request的response对象，最终返回true/false。
 * @param {String} requestConfig.callCluster call下游服务的集群信息，如果为服务发现可以传该值，域名调用可以忽略。
 * @param {String} requestConfig.calledPsm call下游服务的psm信息，如果为服务发现可以传该值，域名调用可以忽略。
 * @param {*} $req express的req对象，必须在require-node模块中透传
 * @param {*} $res express的res对象，必须在require-node模块中透传
 */
async function request(reqObj = {}, requestConfig = {}, $req, $res) {
  const { url, data = {}, query = {}, method, headers = {}, timeout = 1000 } = reqObj;
  const {
    needHeaders = false,
    logBizError = true,
    callCluster = 'default',
    calledPsm = '-'
  } = requestConfig || {};
  let uri = url.trim();
  const logId = Log.genLogId($res);
  const dataOption = { qs: query };
  delete reqObj.url;
  delete reqObj.query;
  // 针对JSON
  if (typeof data === 'string') {
    dataOption.body = data;
    delete reqObj.data;
  } else {
    Object.keys(data).forEach(key => {
      data[key] = String(data[key]);
    });
    dataOption.form = data;
    delete reqObj.data;
  }
  try {
    Log.info({
      logId,
      message: `开始请求: ${uri} ${JSON.stringify(headers)} ${JSON.stringify(dataOption)}`
    });
    const callBg = getUs();
    const res = await promiseRequest({
      uri,
      ...reqObj,
      ...dataOption,
      gzip: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-TT-LOGID': logId,
        ...headers
      },
      method,
      timeout,
      followAllRedirects: true,
      debug: false,
      time: true,
      useQuerystring: true,
    });
    const callDuration = getUs() - callBg;
    let resBody = res.body;
    Log.info({
      logId,
      message: `duration: ${callDuration} 结果返回: ${JSON.stringify(resBody)}`
    });
    Log.call({
      method: res.request.method,
      rip: `${res.request.host}:${res.request.port}`,
      called: calledPsm,
      cluster: callCluster,
      cost: (res.timingPhases.total  * 1000) << 0,
      status: res.statusCode,
      stress_tag: Log.getStress(res)
    }, {
      logId,
    });
    if (res.headers['content-type'].match('application/json')) {
      resBody = JSON.parse(res.body);
      resBody.LOGID = logId;
    }
    if (res.statusCode === 200) {
      if (needHeaders) {
        return ({ body: resBody, headers: res.headers });
      } else {
        return resBody;
      }
    }
    checkLogBizError(logBizError, res) && Log.error({
      logId,
      message: `${uri} ${res.statusCode} ${res.statusMessage} ${JSON.stringify(resBody)}`
    });
    return { status: 'error', message: `${res.statusCode} ${res.statusMessage}`, body: resBody };
  } catch (e) {
    Log.error({
      logId,
      message: `${uri} ${Log.getErrorString(e)}`
    });
    return {
      status: 'error',
      message: e
    };
  }

}

function get(obj, requestConfig, $req, $res) {
  return request({ ...obj, method: 'GET' }, requestConfig, $req, $res);
}

function post(obj, requestConfig, $req, $res) {
  return request({ ...obj, method: 'POST' }, requestConfig, $req, $res);
}

function postJSON(arg, requestConfig, $req, $res) {
  const obj = { ...arg };
  if (arg.data && typeof arg.data === 'object') {
    obj.data = JSON.stringify(arg.data);
    obj.headers = arg.headers || {};
    obj.headers['Content-Type'] = 'application/json; charset=UTF-8';
  }
  return post(obj, requestConfig, $req, $res);
}


function headerFormat(headers) {
  const newheaders = {};
  Object.keys(headers).forEach(field => {
    // contend-encoding造成require-node错误
    if (field.match(/content-encoding/i)) return;
    switch (typeof headers[field]) {
    case 'string':
    case 'number':
      newheaders[field] = headers[field];
      break;
    case 'object':
      if (headers[field]) {
        if (Array.isArray(headers[field])) newheaders[field] = headers[field].join('; ');
        else newheaders[field] = JSON.stringify(headers[field]);
      }
      break;
    }
  });
  return newheaders;
}
function injectHeaderRequest(requestFunc) {
  return async function (reqObj, requestConfig, $req, $res) {
    try {
      const Cookie = Object.keys($req.cookies).map(k => `${k}=${encodeURIComponent($req.cookies[k])}`).join('; ');
      const { headers = {} } = reqObj;
      headers.Cookie = Cookie;
      const response = await requestFunc({ ...reqObj, headers }, { ...requestConfig, needHeaders: true });
      if (response.headers) {
        const resHeaders = headerFormat(response.headers);
        $res.set(resHeaders);
      }
      if (!requestConfig.needHeaders && response.body && response.headers)
        return response.body;
      return response;
    } catch (e) {
      return e;
    }
  };
}

// deep请求，自带header透传
const deepRequest = {
  get: injectHeaderRequest(get),
  post: injectHeaderRequest(post),
  postJSON: injectHeaderRequest(postJSON)
};
export {
  get,
  post,
  postJSON,
  deepRequest
};