const app =  {
  ListApp: {},
  CreateApp: {
    method: 'post',
  },
  UpdateApp: {
    method: 'post',
  },
  DeleteApp: {
    method: 'post',
  }
};
Object.keys(app).forEach(name => {
  app[name].service = 'rbac';
});
export default app;