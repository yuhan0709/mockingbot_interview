import {
  message,
} from 'antd';
import {
  GetAllDomainAndApp,
  GetStreamList,
  GetAppInfo,
  GetDomainInfo,
  GetDomainStatusHistory,
  GetStreamStatusHistory,
  GetStreamStatus,
} from '../server/api/fe.videoarch.fcdn/request';

const messageErrorApi = {
  GetAllDomainAndApp,
  GetAppInfo,
  GetStreamList,
  GetDomainStatusHistory,
  GetStreamStatusHistory,
  GetStreamStatus,
  GetDomainInfo
};

Object.keys(messageErrorApi).forEach(key => {
  const oldFunction = messageErrorApi[key];
  messageErrorApi[key] = async function (...rest) {
    const res = await oldFunction.apply(this, rest);
    if (res.code === 0) {
      return res;
    }
    message.error(res.message || `发生未知错误：${JSON.stringify(res)}`);
    return Promise.reject(res);
  };
});

export default messageErrorApi;