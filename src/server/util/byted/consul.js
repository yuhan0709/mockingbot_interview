/**
 * 简单处理的服务发现逻辑
 * 1. 本地开发走boe服务发现
 * 2. 本地开发、boe环境自动查询名为test的集群
 * @author wuchenkai@bytedance.com
 */
import bConsul from '@byted-service/consul';
import { agentHost, isTCEProd } from './env';

const defaultConfig = {
  host: agentHost,
  port: 2280
};
export class ServiceWatcher extends bConsul.ServiceWatcher{
  constructor(option = {}) {
    const {
      consul = {}
    } = option;
    super({ ...option, consul: { ...defaultConfig, ...consul } });
  }
  addService(service, options = {}) {
    const testCluster = options.testCluster || '*';
    const lookupOption = !isTCEProd ? {
      cluster: testCluster
    } : { cluster: '*' };
    options = Object.assign({}, lookupOption, options);
    return super.addService.call(this, service, options);
  }
}

export default class Consul extends bConsul {
  constructor(option = {}) {
    super({ ...defaultConfig, ...option });
  }
  lookup(service, options = {}) {
    const testCluster = options.testCluster || '*';
    const lookupOption = !isTCEProd ? {
      cluster: testCluster
    } : { cluster: '*' };
    options = Object.assign({}, lookupOption, options);
    return super.lookup.call(this, service, options);
  }
}
