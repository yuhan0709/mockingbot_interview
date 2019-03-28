import { exec } from '../../../server/api/vadmin/request/index';
import {
  message,
} from 'antd';
// 这个页面是用Proxy重写了get方法，用上了错误处理
const Apis = new Proxy({}, {
  get: function (_, key) {
    let func = async function(reqObject = {}, noError){
      try {
        // 这里的this应该就是指获取的方法。
        const res = await exec.call(this, key, reqObject, '$curUser');
        if (typeof res !== 'object') return res;
        if (res.body && res.body.ResponseMetadata && res.body.ResponseMetadata.Error && res.body.ResponseMetadata.Error.Code === 'ErrorSpecNotExisted') {

          return Promise.reject(res);
        }
        if (res.ResponseMetadata) {
          if (res.ResponseMetadata === 'error') {
            Promise.reject(new Error());
          }
          return res.Result;
        }
        if (!noError) {
          if (res.body && res.body.ResponseMetadata)
            message.error(res.body.ResponseMetadata.Error.Message || '网络繁忙，请稍后重试', 5);
          else if (res.message) {
            if (typeof res.message === 'object' && res.message.code === 'ESOCKETTIMEDOUT') message.error('接口超时，请稍后重试', 5);
            else message.error(res.message, 5);
          }
        }
        if (Object.prototype.toString.call(res) === '[object Array]') {
          return res;
        }
        return Promise.reject(res);
      } catch (e) {
        let errorMessage = '网络繁忙，请稍后重试';
        if (e.body && e.body.ResponseMetadata && e.body.ResponseMetadata.Error && e.body.ResponseMetadata.Error.Code) {
          errorMessage = e.body.ResponseMetadata.Error.Code;
        }
        message.error(errorMessage, 5);
        return Promise.reject(e);
      }
    };
    return func;
  }
});

export default Apis;