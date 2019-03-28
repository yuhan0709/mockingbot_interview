/**
 * 日志模块
 * 正常的Info日志与Error日志只需要传message及logId即可
 * access日志由 @fe/middleware统一打印 不需要特殊处理
 * call日志需要按需传入参数
 * 根据规范 线上日志主要存储在三个位置
 * /opt/tiger/toutiao/log/app/$psm.log 业务日志 包括Info和Error
 * /opt/tiger/toutiao/log/app/$psm.access.log 服务被调用日志 Access
 * /opt/tiger/toutiao/log/rpc/$psm.call.log 调用下游服务日志 Call
 * @author wuchenkai@bytedance.com
 */
import Logger from '@byted-service/logger';
import BytedEnv from '@byted-service/env';
import { getLogId } from '@fe/logid';
import MSMetrics from './msMetrics';
import { isTCEProd, isTest } from './env';

export const TT_LOGID_HEADER_KEY = 'x-tt-logid';
const psm = BytedEnv.psm;
const env = isTest ? 'test' : (isTCEProd ? 'prod' : 'dev');

// 线上环境 包括tce与staging
const enableFileLog = isTCEProd || isTest;

const logDir = '/opt/tiger/toutiao/log/app/';
const callLogDir = '/opt/tiger/toutiao/log/rpc/';

// tce与boe都输出文件日志 boe不上传日志
export const loggerConfig = {
  dir: logDir,
  enableFileLog: enableFileLog,
  enableConsoleLog: !enableFileLog,
  enableDatabusLog: isTCEProd,
  callSiteFrameIndex: 2,
};

const infoLogger = new Logger({
  ...loggerConfig,
  filename: psm,
});
const errorLogger = new Logger({
  ...loggerConfig,
  level: 'error',
  filename: psm,
});
const callLogger = new Logger({
  ...loggerConfig,
  dir: callLogDir,
  level: 'trace',
  filename: `${psm}.call`,
});

/**
 * 限制日志message的长度 默认启用该逻辑
 * @param {Object} obj 日志参数对象
 * @param {Number} sliceLength 限制长度
 */
function sliceMessage(obj, sliceLength = 500) {
  if (obj.message && obj.message.length > sliceLength) {
    obj.message = obj.message.slice(0, sliceLength) + '...';
  }
}

/**
 * 日志对象校验、处理
 * @param {Object} logObj 日志对象
 * @param {Object} logConfig 日志Config
 */
function validatLogObj(logObj, logConfig) {
  if (!logObj.message) throw new Error('log message is require');
  !logConfig.noSliceMessage && sliceMessage(logObj, logConfig.sliceLength);
}

/**
 * info日志
 * @param {Object}  logObj 日志对象 参考 @byted-service/Logger log方法
 * @param {String}  logObj.logId 日志Id
 * @param {String}  logObj.message 日志内容
 * @param {Object}  logConfig 日志配置
 * @param {Boolean} logConfig.noSliceMessage 是否日志长度做限制 默认true
 * @param {Number}  logConfig.sliceLength 限制长度 默认500
 */
function info(logObj, logConfig = {}) {
  validatLogObj(logObj, logConfig);
  infoLogger.log({
    ...logObj
  });
}

/**
 * error日志
 * @param {Object}  logObj 日志对象 参考 @byted-service/Logger log方法
 * @param {String}  logObj.logId 日志Id
 * @param {String}  logObj.message 日志内容
 * @param {Object}  logConfig 日志配置
 * @param {Boolean} logConfig.noSliceMessage 是否日志长度做限制 默认true
 * @param {Number}  logConfig.sliceLength 限制长度 默认500
 * @param {String}  logConfig.errorLevel 上报至ms平台的日志级别 默认'ERROR'
 */
function error(logObj, logConfig = {}) {
  validatLogObj(logObj, logConfig);
  errorLogger.log({
    level: 'error',
    ...logObj
  });
  MSMetrics.log.throughput(logConfig.errorLevel || 'ERROR');
}

/**
 * call日志 request模块自动调用
 * @param {Object} callInfo call日志相关信息
 * @param {String} callInfo.method 被调用的方法名
 * @param {String} callInfo.rip 被调用服务的ip:port
 * @param {String} callInfo.called 被调用服务的psm
 * @param {String} callInfo.cluster 被调用服务的集群
 * @param {Number} callInfo.cost 调用耗时单位us
 * @param {Number} callInfo.status 回调状态码
 * @param {Object} logObj
 */
function call(callInfo, logObj = {}) {
  if (!callInfo) throw new Error('callInfo is required');
  const {
    method = '-',
    rip = '-',
    called = '-',
    cluster = '-',
    cost = '-',
    status = 200,
    stress_tag = '',
  } = callInfo;
  const message = `method=${method} rip=${rip} called=${called} cluster=${cluster} cost=${cost} status=${status} env=${env} stress_tag=${stress_tag}`;
  callLogger.log({
    level: 'trace',
    ...logObj,
    message,
  });
}

/**
 * 从header中获取logId，经过logger()中间件时会自动生成
 * @param {Express.Response} $res express中间件的res参数
 */
function genLogId($res) {
  if ($res && $res.get && typeof $res.get === 'function') {
    const headerLogId = $res.get(TT_LOGID_HEADER_KEY);
    if (headerLogId) {
      return headerLogId;
    }
  }
  const logId = getLogId();
  if ($res && $res.set && typeof $res.set === 'function') {
    $res.set(TT_LOGID_HEADER_KEY, logId);
  }
  return logId;
}

/**
 * 获取标准化error信息
 * @param {Object|Error} err
 */
function getErrorString(err) {
  if (typeof err === 'object') {
    if (err instanceof Error) {
      return String(err.message);
    }
    return JSON.stringify(err);
  }
  return err;
}

/**
 * 从header中获取stress，用于call日志
 * @param {Object} response request模块返回的对象
 */
function getStress(response) {
  let stress = '';
  if (response && response.headers) {
    stress = response.headers['x-tt-stress'] || '';
  }
  return stress;
}

export default {
  info,
  error,
  call,
  genLogId,
  getErrorString,
  getStress
};
