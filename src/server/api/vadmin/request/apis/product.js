const product = {
  ListProduct: {},
  CreateProducts: {
    method: 'postJSON',
  },
  GetProduct: {
    permission: ['ExpenseInstancePermissionApis']
  },
  UpdateProducts: {
    method: 'postJSON',
  },
  CreateProducts2: {
    method: 'postJSON',
  },
  UpdateProducts2: {
    method: 'postJSON',
  },
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