import { getISOString } from '../util/format';
import { GetAccount } from '../enhance';

const instance = {
  ListInstance: {
    callback: async (res, $req, $res) => {
      if (typeof res === 'string') {
        return res;
      }
      res.Result.Instances = res.Result.Instances.map(bm => {
        return bm;
      });
      const bms = [];
      for (let i = 0; i < res.Result.Instances.length; i++) {
        bms.push({
          ...res.Result.Instances[i],
          Identity: await (async Identity => {
            const res = (await GetAccount({ Identity }, null, $req, $res)).Result;
            if (res) {
              return res.Identity;
            } else {
              return Identity;
            }
          })(res.Result.Instances[i].AccountId)
        });
      }
      res.Result.Instances = bms;
      return res;
    }
  },
  TrialPostInstance: {
    method: 'post',
    func(reqObj) {
      if (reqObj.TestBeginTime) reqObj.TestBeginTime = getISOString(reqObj.TestBeginTime);
      if (reqObj.TestEndTime) reqObj.TestEndTime =  getISOString(reqObj.TestEndTime);
      return {
        data: reqObj
      };
    }
  },
  UpgradePostInstance: {
    method: 'post',
    func(reqObj) {
      if (reqObj.BeginTime) reqObj.BeginTime = getISOString(reqObj.BeginTime);
      return {
        data: reqObj
      };
    }
  }
};

Object.keys(instance).forEach(name => {
  if (instance[name].permission) {
    if (!Array.isArray(instance[name].permission)) {
      instance[name].permission = [instance[name].permission];
    }
  } else {
    instance[name].permission = [];
  }
  instance[name].permission.push('ExpensePermissionApis', 'ExpenseInstancePermissionApis');
  instance[name].service = 'trade';
});

export default instance;