import { getISOString } from '../util/format';
import { GetAccount } from '../enhance';
const bill =  {
  GroupBill: {
    func(reqObj) {
      if (reqObj.BeginTime) reqObj.BeginTime = getISOString(reqObj.BeginTime);
      if (reqObj.EndTime) reqObj.EndTime =  getISOString(reqObj.EndTime);
      return {
        query: reqObj,
        timeout: 60000
      };
    },
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
  SummaryBill: {
    func(reqObj) {
      if (reqObj.BeginTime) reqObj.BeginTime = getISOString(reqObj.BeginTime);
      if (reqObj.EndTime) reqObj.EndTime =  getISOString(reqObj.EndTime);
      return {
        query: reqObj,
        timeout: 60000
      };
    },
  },
  SummaryMonthlyBill: {
    func(reqObj) {
      if (reqObj.BeginTime) reqObj.BeginTime = getISOString(reqObj.BeginTime);
      if (reqObj.EndTime) reqObj.EndTime =  getISOString(reqObj.EndTime);
      return {
        query: reqObj,
        timeout: 60000
      };
    },
  },
  SummaryProductGroupMonthlyBill: {
    func(reqObj) {
      if (reqObj.BeginTime) reqObj.BeginTime = getISOString(reqObj.BeginTime);
      if (reqObj.EndTime) reqObj.EndTime =  getISOString(reqObj.EndTime);
      return {
        query: reqObj,
        timeout: 60000
      };
    },
  },
  SummaryServiceTreeMonthlyBill: {
    func(reqObj) {
      if (reqObj.BeginTime) reqObj.BeginTime = getISOString(reqObj.BeginTime);
      if (reqObj.EndTime) reqObj.EndTime =  getISOString(reqObj.EndTime);
      return {
        query: reqObj,
        timeout: 60000
      };
    },
  },
  RealTimeTradeInfo: {
    func(reqObj) {
      if (reqObj.BeginTime) reqObj.BeginTime = getISOString(reqObj.BeginTime);
      if (reqObj.EndTime) reqObj.EndTime =  getISOString(reqObj.EndTime);
      return {
        query: reqObj,
        timeout: 60000
      };
    },
  },
  ListBill: {
    func(reqObj) {
      if (reqObj.BeginTime) reqObj.BeginTime = getISOString(reqObj.BeginTime);
      if (reqObj.EndTime) reqObj.EndTime =  getISOString(reqObj.EndTime);
      return {
        query: reqObj,
        timeout: 60000
      };
    },
    callback: async (res, $req, $res) => {
      if (typeof res === 'string') return res;
      res.Result.BillMetadatas = res.Result.BillMetadatas.map(bm => {
        return bm;
      });
      const bms = [];
      // for (let i = 0; i < res.Result.BillMetadatas.length; i++) {
      //   bms.push({
      //     ...res.Result.BillMetadatas[i],
      //     Identity: (await GetAccount({ Identity: res.Result.BillMetadatas[i].AccountId }, null, $req, $res)).Result.Identity
      //   });
      // }
      for (let i = 0; i < res.Result.BillMetadatas.length; i++) {
        bms.push({
          ...res.Result.BillMetadatas[i],
          Identity: await (async Identity => {
            const res = (await GetAccount({ Identity }, null, $req, $res)).Result;
            if (res) {
              return res.Identity;
            } else {
              return Identity;
            }
          })(res.Result.BillMetadatas[i].AccountId)
        });
      }
      res.Result.BillMetadatas = bms;
      return res;
    }
  },
  GetBill: {}
};
Object.keys(bill).forEach(name => {
  if (bill[name].permission) {
    if (!Array.isArray(bill[name].permission)) {
      bill[name].permission = [bill[name].permission];
    }
  } else {
    bill[name].permission = [];
  }
  bill[name].service = 'trade';
  bill[name].permission.push('ExpensePermissionApis', 'ExpenseBillPermissionApis');
});
export default bill;