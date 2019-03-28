import RedisCreator from '@byted-service/redis-creator';
import Log from './byted/log';
import { agentHost, isTCEProd } from './byted/env';

const config = {
  redisGroup: {
    userInfo: {
      psm: 'toutiao.redis.vadmin_user_info'
    },
    permission: {
      psm: 'toutiao.redis.vadmin_permission'
    }
  }
};

/**
 * redis client生成函数
 * 自动判断当前环境选择不同的服务发现方式以及redis集群
 * ENABLE_CONSUL的情况下连接127.0.0.1:2280进行查询
 * 其他情况下连接开发机10.8.125.131:2280进行查询
 * 在tce线上以外的环境中连接的redis集群默认添加 _test结尾。
 * 可以配置useTestSuffix false关闭该功能，也可以配置testSuffix修改该后缀。
 * 注意申请相关集群。
 */
async function initRedis(psm, redisCreatorOption = {}, createOption = {}, initOptions = {}) {
  const options = {
    consul: {
      host: agentHost,
      port: 2280
    }
  };
  const {
    useTestSuffix = true,
    testSuffix = '_test'
  } = initOptions;
  const realPsm = (isTCEProd || !useTestSuffix) ? psm : (psm + testSuffix);
  Log.info({
    message: `redis connect psm: ${realPsm}`
  });
  let redis = await new RedisCreator({ ...options, ...redisCreatorOption }).create({
    psm: realPsm,
    ...createOption,
  });
  return redis;
}
const defaultRedis = {
  get: () => {},
  set: () => {}
};
const RedisGroup = {};
const redisOptions = config.redisGroup || {};
Object.keys(redisOptions).forEach(redisKey => {
  RedisGroup[redisKey] = defaultRedis;
});
export function initRedisGroup() {
  Object.keys(redisOptions).forEach(async (redisKey) => {
    const { redisCreatorOption = {}, createOption = {}, psm } = redisOptions[redisKey];
    RedisGroup[redisKey] = await initRedis(psm, redisCreatorOption, createOption);
  });
}
export default RedisGroup;
