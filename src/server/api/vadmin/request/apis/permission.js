const permission = {
  AddGroupPermission: {
    method: 'post',
  },
  ListGroupPermission: {
  },
  UpdateGroupPermission: {
    method: 'post',
  },
  RemoveGroupPermission: {
    method: 'post',
  },
};
Object.keys(permission).forEach(key => {
  permission[key].service = 'rbac';
});
export default permission;