export const mockHost = 'https://mock.bytedance.net/mock/5b2f3feeb072ff01b6f632a7/vadmin';
// const host = 'http://cloudplatform-admin.byted.org';

export const GLOBAL_IS_MOCK = false;

export const PERMISSIONTIPS = {
  APermissionApis: '暂无Admin权限',
  AMPermissionApis: '暂无Manager/Admin权限',
  MPermissionApis: '暂无Manager权限',
  MDocOPermissionApis: '暂无文档管理权限',
  MTopOPermissionApis: '暂无Top接口管理权限',
  ExpensePermissionApis: '暂无财务管理员权限',
  AccountPermissionApis: '暂无账号管理员权限',
  TopManagerPermissionApis: '暂无Top模块管理员权限',
  ExpenseCostPermissionApis: '暂无成本统计权限',
  ExpenseCostVodPermissionApis: '暂无成本统计点播权限',
  ExpenseCostLivePermissionApis: '暂无成本统计直播权限',
  ExpenseInstancePermissionApis: '暂无实例管理权限',
  ExpenseOrderPermissionApis: '暂无订单管理权限',
  ExpenseBillPermissionApis: '暂无账单管理权限',
  ExpenseProductPermissionApis: '暂无商品管理权限',
  OPSAdminPermissionApis: '暂无产品运维管理权限',
  OPSIAMPermissionApis: '暂无IAM管理权限',
  DocEPermissionApis: '暂无文档编辑权限'
};

export const RBAC_APPS = {
  public: {
    name: 'Public',
  },
  doc: {
    name: '文档中心'
  },
  top: {
    name: 'Top管理'
  },
  expense: {
    name: '财务管理'
  },
  account: {
    name: '账号管理'
  },
  ops: {
    name: '产品运维'
  }
};