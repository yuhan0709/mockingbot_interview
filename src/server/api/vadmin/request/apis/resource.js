const resource =  {
  ListResource: {},
  CreateResource: {
    method: 'post',
  },
  UpdateResource: {
    method: 'post',
  },
  DeleteResource: {
    method: 'post',
  }
};
Object.keys(resource).forEach(name => {
  resource[name].service = 'rbac';
});
export default resource;