const manager =  {
  ListAppManager: {},
  AddAppManager: {
    method: 'post',
  },
  RemoveAppManager: {
    method: 'post',
  }
};
Object.keys(manager).forEach(name => {
  manager[name].service = 'rbac';
});
export default manager;