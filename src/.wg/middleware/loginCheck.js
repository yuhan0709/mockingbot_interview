import { login } from './auth';
let whiteList = [/^\/static/, /^\/require-node/, /\/index.html$/, /^\/ip/, /^\/login/, /^\/logout/];

export default ({ sso = {} }) => async function loginCheck(req, res, next) {
  if (!whiteList.some(re => !!req.originalUrl.match(re))) {
    // sso必须要有session
    if (!req.session || !req.session.curUser) {
      if (req.cookies['connect.sid']) {
        await login({ sso })(req, res);
      } else {
        res.redirect(req.originalUrl);
      }
      return;
    }
  }
  next();
};