const permission = { account: {}, public: {}, expense: {}, top: {}, doc: {}, ops: {}, ...window.INIT_CONFIG.permission };
export default (pageConfig) => {
// 针对普通用户进行页面权限控制
  if (!permission.public.developer) {
    if (Object.keys(permission.account).length < 1) {
      delete pageConfig.account;
    }
    if (Object.keys(permission.expense).length < 1) {
      delete pageConfig.billing;
    } else {
      if (!permission.expense.admin){
        Object.keys(pageConfig.billing.children).forEach((pageKey) => {
          const key = pageKey === 'billOverview' ? 'bill' : pageKey;
          if (Object.keys(permission.expense).filter(permissionKey => permissionKey.startsWith(key)).length > 0) {
            return;
          }
          if (pageConfig.billing.children[key].children) {
            Object.keys(pageConfig.billing.children[key].children).forEach(childKey => {
              if (!permission.expense[key + '_' + childKey]) {
                delete pageConfig.billing.children[key].children[childKey];
              }
            });
            if (Object.keys(pageConfig.billing.children[key].children).length > 0) {
              return;
            }
          }
          delete pageConfig.billing.children[key];
        });
      }
    }
    if (Object.keys(permission.doc).length < 1 && Object.keys(permission.top).length < 1) {
      delete pageConfig.base;
    } else if (Object.keys(permission.doc).length < 1) {
      delete pageConfig.base.children.doc;
    } else if (Object.keys(permission.top).length < 1) {
      delete pageConfig.base.children.top;
    }
    if (Object.keys(permission.ops).length < 1) {
      delete pageConfig.ops;
    } else if (!permission.ops.admin){
      Object.keys(pageConfig.ops.children).forEach((key) => {
        if (!permission.ops[key]) {
          delete pageConfig.ops.children[key];
        }
      });
      if (Object.keys(pageConfig.ops.children).length < 1) {
        delete pageConfig.ops;
      }
    }
  }
  // 当只剩下rbac时，认为用户无任何权限
  if (Object.keys(pageConfig).length === 1 && pageConfig.rbac) {
    delete pageConfig.rbac;
  }
};
