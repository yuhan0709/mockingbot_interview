import { getISOString } from '../util/format';
const productGroup = {
  List: {},
  GetProductGroup: {
    permission: ['ExpenseOrderPermissionApis', 'ExpenseInstancePermissionApis']
  },
  ListProductsByGroup: {
    permission: ['ExpenseInstancePermissionApis']
  },
  ListProductGroupsByAccount: {},
  ListSpecialProductGroups: {
    func: query => {
      if (query.BeginTime) {
        query.BeginTime = getISOString(query.BeginTime);
      }
      if (query.EndTime) {
        query.EndTime = getISOString(query.EndTime);
      }
      return {
        query
      };
    },
    callback: res => {
      const time = new Date().getTime() / 1000;
      res.Result.ProductGroupMetadatas = res.Result.ProductGroupMetadatas.map(pgm => {
        if (pgm.BeginTime > time || pgm.EndTime < time) {
          pgm.expiry = true;
        } else {
          pgm.expiry = false;
        }
        return pgm;
      });
      return res;
    }
  },
  CreateProductGroup: {
    method: 'post',
    func: query => {
      const data = {
        BillingMethodSets: query.BillingMethodSets
      };
      delete query.BillingMethodSets;
      query = {
        ...query,
        BeginTime: getISOString(query.BeginTime),
        EndTime: getISOString(query.EndTime)
      };
      return {
        query,
        data
      };
    }
  },
  UpdateProductGroup: {
    method: 'post',
    func: query => {
      const data = {
        BillingMethodSets: query.BillingMethodSets
      };
      delete query.BillingMethodSets;
      query = {
        ...query,
        BeginTime: getISOString(query.BeginTime),
        EndTime: getISOString(query.EndTime)
      };
      return {
        query,
        data
      };
    }
  },
  ListProductGroupService: {},
  ListCommonProductGroup: {
  },
  ListSpecialProductGroup: {
    func: query => {
      if (query.BeginTime) {
        query.BeginTime = getISOString(query.BeginTime);
      }
      if (query.EndTime) {
        query.EndTime = getISOString(query.EndTime);
      }
      return {
        query
      };
    },
    callback: res => {
      const time = new Date().getTime() / 1000;
      res.Result.ProductGroupMetadatas = res.Result.ProductGroupMetadatas.map(pgm => {
        if (pgm.BeginTime > time || pgm.EndTime < time) {
          pgm.expiry = true;
        } else {
          pgm.expiry = false;
        }
        return pgm;
      });
      return res;
    }
  },
  CreateSpecialProductGroup: {
    method: 'post',
    func: data => {
      if (data.BeginTime) {
        data.BeginTime = getISOString(data.BeginTime);
      }
      if (data.EndTime) {
        data.EndTime = getISOString(data.EndTime);
      }
      return {
        data
      };
    },
  },
  UpdateSpecialProductGroup: {
    method: 'post',
    func: data => {
      if (data.BeginTime) {
        data.BeginTime = getISOString(data.BeginTime);
      }
      if (data.EndTime) {
        data.EndTime = getISOString(data.EndTime);
      }
      return {
        data
      };
    },
  },
  CreateProduct: {
    method: 'postJSON',
  },
  UpdateProduct: {
    method: 'post',
  },
};

Object.keys(productGroup).forEach(name => {
  if (productGroup[name].permission) {
    if (!Array.isArray(productGroup[name].permission)) {
      productGroup[name].permission = [productGroup[name].permission];
    }
  } else {
    productGroup[name].permission = [];
  }
  productGroup[name].permission.push('ExpensePermissionApis', 'ExpenseProductPermissionApis');
  productGroup[name].service = 'trade';
});

export default productGroup;