export default (req, res, next) => {
  if (req.originalUrl === '/') {
    res.redirect('/app');
    return;
  }
  next();
};