const account =  {
  QueryAccount: {},
  GetServiceMap: {},
  UpdateAccount: {
    method: 'post'
  },
  SetAccountServiceOn: {
    method: 'post'
  },
};

Object.keys(account).forEach(name => {
  account[name].permission = 'AccountPermissionApis';
});

export default account;