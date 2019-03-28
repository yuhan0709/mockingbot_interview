const apis =  {
  CreateSystemPolicy: {},
  GetSystemPolicy: {},
  UpdateSystemPolicy: {},
  ListSystemPolicies: {},
};

Object.keys(apis).forEach(key => {
  apis[key].service = 'policy';
  apis[key].permission = 'OPSIAMPermissionApis';
});
export default apis;