// server side
import Metrics from '@byted-service/metrics';
import { agentHost } from './byted/env';
const msDefaultPrefix = 'toutiao.service';
const psm = process.env.PROJCET_PSM;
const defaultOption = {
  host: agentHost,
  port: 9123,
  defaultPrefix: msDefaultPrefix,
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
  return handleMethod.replace(/\W/g, '');
}
const LOG_LEVEL_SET = new Set(['WARNING','ERROR','CRITICAL']);

function validateLogLevel(logLevel) {
  const isRight = LOG_LEVEL_SET.has(logLevel);
  if (!isRight) {
    throw new Error('level only can use WARNING/ERROR/CRITICAL');
  }
  return isRight;
}

const api = {
  metrics: apiMetrics,
  success(handleMethod, latency) {
    // handle_method 不支持特殊字符
    const handle_method = formatHandleMethod(handleMethod);
    apiMetrics.emitTimer('success.latency.us', latency, undefined, {
      handle_method,
      from_cluster: 'default',
      to_cluster: 'default'
    });
    apiMetrics.emitCounter('success.throughput', 1, undefined, {
      handle_method,
      from_cluster: 'default',
      to_cluster: 'default'
    });
    request.success();
  },
  error(handleMethod) {
    const handle_method = formatHandleMethod(handleMethod);
    apiMetrics.emitCounter('error.throughput', 1, undefined, {
      handle_method,
      from_cluster: 'default',
      to_cluster: 'default'
    });
    request.fail();
  }
};

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
      to_cluster: 'default'
    });
  },
  fail() {
    requestMetrics.emitCounter('total', 1, undefined, {
      status: 'fail',
      from: psm,
      from_cluster: 'default',
      to_cluster: 'default'
    });
  }
};

export default {
  api,
  log,
  request
};