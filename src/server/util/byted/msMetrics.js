// server side
import Metrics from '@byted-service/metrics';
import env from '@byted-service/env';
import now from 'performance-now';
import { agentHost } from './env';

const msDefaultPrefix = 'toutiao.service';
const psm = env.psm;
const defaultOption = {
  // 本机开发时使用测试环境metrics打点
  host: agentHost,
  port: 9123,
  bufferSize: 10,
  flushInterval: 3 * 1000
};

const apiMetrics = new Metrics({
  ...defaultOption,
  defaultPrefix: `${msDefaultPrefix}.http.${psm}.calledby`
});

const logMetrics = new Metrics({
  ...defaultOption,
  defaultPrefix: `${msDefaultPrefix}.log.${psm}`
});

const requestMetrics = new Metrics({
  ...defaultOption,
  defaultPrefix: `${msDefaultPrefix}.request.${psm}`
});

function formatHandleMethod(handleMethod) {
  return handleMethod.replace(/\W/g, '_');
}
const LOG_LEVEL_SET = new Set(['WARNING','ERROR','CRITICAL']);

function validateLogLevel(logLevel) {
  const isRight = LOG_LEVEL_SET.has(logLevel);
  if (!isRight) {
    throw new Error('level only can use WARNING/ERROR/CRITICAL');
  }
  return isRight;
}

/**
 * node api的访问统计 handleMethod为接口名 请自行定义
 * latency为时延 单位us
 */
const api = {
  metrics: apiMetrics,
  success(handleMethod, latency) {
    // handle_method 不支持特殊字符
    const handle_method = formatHandleMethod(handleMethod);
    apiMetrics.emitTimer('success.latency.us', latency, undefined, {
      handle_method,
      from_cluster: 'default',
      to_cluster: env.cluster
    });
    apiMetrics.emitCounter('success.throughput', 1, undefined, {
      handle_method,
      from_cluster: 'default',
      to_cluster: env.cluster
    });
    request.success();
  },
  error(handleMethod) {
    const handle_method = formatHandleMethod(handleMethod);
    apiMetrics.emitCounter('error.throughput', 1, undefined, {
      handle_method,
      from_cluster: 'default',
      to_cluster: env.cluster
    });
    request.fail();
  }
};

/**
 * 日志打点 由log模块调用
 */
const log = {
  metrics: logMetrics,
  throughput(level) {
    if (validateLogLevel(level)) {
      logMetrics.emitCounter('throughput', 1, undefined, {
        level,
      });
    }
  }
};

const request = {
  metrics: requestMetrics,
  success() {
    requestMetrics.emitCounter('total', 1, undefined, {
      status: 'success',
      from: psm,
      from_cluster: 'default',
      to_cluster: env.cluster
    });
  },
  fail() {
    requestMetrics.emitCounter('total', 1, undefined, {
      status: 'fail',
      from: psm,
      from_cluster: 'default',
      to_cluster: env.cluster
    });
  }
};

/**
 * getUs函数 获得一个us时间值
 */
export function getUs() {
  return (now() * 1000) << 0;
}

export default {
  api,
  log,
  request
};