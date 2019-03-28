const billing = {
  ListBillingMethodCategories: {},
  ListBillingMethodTemplates: {}
};

Object.keys(billing).forEach(name => {
  billing[name].permission = ['ExpensePermissionApis', 'ExpenseProductPermissionApis'];
  billing[name].service = 'trade';
});
export default billing;