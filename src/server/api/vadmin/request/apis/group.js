const group =  {
  ListAppGroup: {},
  CreateAppGroup: {
    method: 'post',
  },
  UpdateAppGroup: {
    method: 'post',
  },
  DeleteAppGroup: {
    method: 'post',
  },
  ListEmployeeOfGroup: {},
  AddEmployeeToGroup: {
    method: 'post',
  },
  RemoveEmployeeToGroup: {
    method: 'post',
  },
};
Object.keys(group).forEach(name => {
  group[name].service = 'rbac';
});
export default group;