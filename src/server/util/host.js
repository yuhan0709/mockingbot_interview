import { ServiceWatcher } from './byted/consul';
import { isTCEProd } from './byted/env';
const passportPSM = 'toutiao.videoarch.passport';
const isDev = false;
const watcherConfig = {
  passport: {
    psm: passportPSM,
  },
  admin: {
    psm: 'toutiao.videoarch.cloudplatform_admin',
    devDocker: {
      host: '10.8.121.96',
      port: '6789'
    },
  },
  trade: {
    psm: 'toutiao.videoarch.cloud_trade',
  },
  rbac: {
    psm: 'toutiao.videoarch.cloud_admin',
  },
  policy: {
    psm: 'toutiao.videoarch.top',
  },
  mysql: {
    psm: isTCEProd ? 'toutiao.mysql.cloud_admin_write' : 'toutiao.mysql.videocloudaudit_write'
  }
};
const passportWatcher = new ServiceWatcher();
const getHost = {};
Object.keys(watcherConfig).forEach(key => {
  passportWatcher.addService(watcherConfig[key].psm);
  getHost[key] = async function(originDocker = false) {
    let docker = {};
    if (isDev && watcherConfig[key].devDocker) {
      docker = watcherConfig[key].devDocker;
    } else {
      docker = await passportWatcher.getRandomAddress(watcherConfig[key].psm);
    }
    if (originDocker) return docker;
    return `${docker.host}:${docker.port}`;
  };
});
passportWatcher.watch();
export default getHost;