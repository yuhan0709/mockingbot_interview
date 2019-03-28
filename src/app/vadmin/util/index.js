export const existConfig = () => {
  return window.INIT_CONFIG && window.INIT_CONFIG.expenseConfig;
};

export const getExpenseConfig = () => {
  if (existConfig()) {
    return window.INIT_CONFIG.expenseConfig;
  }
  return {};
};

export const gerService = key => {
  let permissions = window.INIT_CONFIG.permission.expense;
  if (permissions.admin || permissions[key]) {
    return Object.keys(window.INIT_CONFIG.expenseConfig.Service).map(key => ({ Name: key }));
  }
  permissions = Object.keys(permissions).filter(permission => {
    console.log('aaa',permission,permission.split('_')[0]);
    return permission.split('_')[0] === key;
  });
  console.log('###',permissions);
  return permissions.map(permission => ({ Name: permission.split('_')[1] }));
};