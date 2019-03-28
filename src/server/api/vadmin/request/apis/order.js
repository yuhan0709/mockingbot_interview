import { getISOString } from '../util/format';
import { GetAccount } from '../enhance';

const order =  {
  SummaryOrder: {
    callback: async (res, $req, $res) => {
      if (typeof res === 'string') return res;
      res.Result.List = res.Result.List.map(bm => {
        return bm;
      });
      const bms = [];
      for (let i = 0; i < res.Result.List.length; i++) {
        bms.push({
          ...res.Result.List[i],
          Identity: await (async Identity => {
            const res = (await GetAccount({ Identity }, null, $req, $res)).Result;
            if (res) {
              return res.Identity;
            } else {
              return Identity;
            }
          })(res.Result.List[i].AccountId)
        });
      }
      res.Result.List = bms;
      return res;
    }
  },
  ListOrder: {
    func(reqObj) {
      if (reqObj.BeginTime) reqObj.BeginTime = getISOString(reqObj.BeginTime);
      if (reqObj.EndTime) reqObj.EndTime =  getISOString(reqObj.EndTime);
      return {
        query: reqObj
      };
    },
    callback: async (res, $req, $res) => {
      if (typeof res === 'string') {
        return res;
      }
      res.Result.OrderMetadatas = res.Result.OrderMetadatas.map(bm => {
        return bm;
      });
      const bms = [];
      for (let i = 0; i < res.Result.OrderMetadatas.length; i++) {
        bms.push({
          ...res.Result.OrderMetadatas[i],
          Identity: await (async Identity => {
            const res = (await GetAccount({ Identity }, null, $req, $res)).Result;
            if (res) {
              return res.Identity;
            } else {
              return Identity;
            }
          })(res.Result.OrderMetadatas[i].AccountId)
        });
      }
      res.Result.OrderMetadatas = bms;
      return res;
    }
  },
  GetOrder: {}
};
Object.keys(order).forEach(name => {
  if (order[name].permission) {
    if (!Array.isArray(order[name].permission)) {
      order[name].permission = [order[name].permission];
    }
  } else {
    order[name].permission = [];
  }
  order[name].permission.push('ExpensePermissionApis', 'ExpenseOrderPermissionApis', 'ExpenseInstancePermissionApis');
  order[name].service = 'trade';
});
export default order;
