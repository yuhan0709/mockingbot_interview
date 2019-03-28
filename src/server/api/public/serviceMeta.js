import * as Request from '../../util/byted/request';
import { isTCEProd } from '../../util/byted/env';

const Apis = {
  smNodes: {
    url: '/api/v2/nodes/',
  },
  smIdChildrenTreeView: {
    url: data => {
      let param = encodeURI(data.id);
      if (param === 'all') {
        param = 0;
      }
      return `/api/v2/nodes/${param}/children?pn=0&rn=9999`;
    }
  }
};

Object.keys(Apis).forEach((key) => {
  const funcConfig = Apis[key];
  Apis[key] = async (data, $req, $res, $curUser) => {
    const host = isTCEProd ? 'galaxy-api.bytedance.net/service_meta' : '10.224.7.47:8386/service_meta';
    const requestObj = typeof funcConfig.url === 'function' ? {
      url: `http://${host}${funcConfig.url(data, $req, $res, $curUser)}`
    } : {
      url: `http://${host}${funcConfig.url}`
    };
    const requestData = funcConfig.func ? funcConfig.func(data, $req, $res, $curUser) : data;
    if (funcConfig.method && funcConfig.method !== 'get') {
      requestObj.data = requestData;
    } else {
      requestObj.query = requestData;
    }
    return Request[funcConfig.method || 'get'](requestObj, {}, $req, $res);
  };
});
export default Apis;