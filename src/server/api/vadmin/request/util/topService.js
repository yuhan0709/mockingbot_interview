import { registerService, HttpMethods, ServiceConfig, getService } from '@byted/console-node-sdk';
import { isTCEProd, hasConsul, agentHost } from '../../../../util/byted/env';
import policy from '../apis/policy.js';
const commonMethod = (method) => ({
  method,
  query: {
    Version: '2018-01-01'
  }
});

const iamServiceInfo = {
  timeout: 1000,
  psm: {
    key: 'toutiao.videoarch.top'
  },
  credential: {
    Region: 'cn-lf-1',
    Service: 'iam'
  },
  name: 'iam'
};
const apis = {
  ...policy,
};
const iamMethods = {};
Object.keys(apis).forEach(key => {
  iamMethods[key] = commonMethod(HttpMethods.GET);
});

const iamServiceConfig = new ServiceConfig({
  service: iamServiceInfo,
  methods: iamMethods,
  needMetaData: true // 这个参数默认为false，返回openAPI结果中的Result，如果设置为true,将直接返回openAPI的所有数据
});
try {
  registerService('iam', iamServiceConfig);
} catch (e) {
  console.log(e);
}

const iamService = getService('iam');

const credentials = !isTCEProd ? {
  accessKeyId: 'AKLTODZlNWI1ODEtNTRlNC00MmEyLWIwYjYtZTI2Nzc4NWQyNmFk',
  secretAccessKey: 'y5spqHmnPaWJs5fGQJAQ2fGK3QFOE1TJpjylcgjDUIYyePEuJvOqMeZxO0IanIAr'
} : {
  accessKeyId: 'AKLTNTgyNTQ1Zjg5MmZhNGFiZGFjMzIxN2I2Mjc4NDY3ODk',
  secretAccessKey: 'cuCng5O0Xr+zwYHTwF+tODcLspUutArx9sXgq/9KA7AlilXTx0HiPeqIOa567rdM'
};

iamService.setCredential(credentials);

const consul = hasConsul
  ? undefined
  : {
    host: agentHost,
    port: 2280,
    env: '*', //
    cluster: '*'
  };
iamService.setConsul(consul);

export default iamService;