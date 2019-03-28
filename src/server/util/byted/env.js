import env from '@byted-service/env';
export const hasConsul = !!process.env.ENABLE_CONSUL;
export const isBoe = env.idc === 'boe';
export const isTest = process.env.TESTING_PREFIX === 'offline';
export const isStaging = isTest && !isBoe;
export const isTCEProd = (process.env.NODE_ENV === 'production') && !isStaging && !isBoe && hasConsul;
// 本地连接boe时 使用boe环境的tos机器进行服务发现
export const agentHost = hasConsul ? '127.0.0.1' : '10.225.68.88';
export const devHost = '10.8.125.131';
export const isProd = process.env.NODE_ENV === 'production';
