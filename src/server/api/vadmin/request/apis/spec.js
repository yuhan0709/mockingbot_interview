const product = {
  CreateSpec: {
    method: 'post',
  },
  ListSpec: {},
  GetSpec: {},
  UpdateSpec: {
    method: 'post',
  }
};

Object.keys(product).forEach(name => {
  if (product[name].permission) {
    if (!Array.isArray(product[name].permission)) {
      product[name].permission = [product[name].permission];
    }
  } else {
    product[name].permission = [];
  }
  product[name].permission.push('ExpensePermissionApis', 'ExpenseProductPermissionApis');
  product[name].service = 'trade';
});

export default product;