// 此页面和用户登陆登出有关

const querystring = require('querystring');
const { get, post } = require('../../server/util/byted/request');
const Log = require('../../server/util/byted/log').default;
// 登陆获取用户信息
module.exports.login = ({ sso = {} }) => {
  return async function login(req, res) {
    const code = req.query.code;
    const logId = Log.genLogId(res);
    if (code) {
      try {
        // session 免登录
        const redirectURI = req.session && req.session.redirectURI || '/';
        const token = await get_sso_token(sso.client_id, sso.client_secret, redirectURI, code, req, res);
        const curUser = await get({ url: 'https://sso.bytedance.com/oauth2/userinfo', query: token, timeout: 3000 }, {}, req, res);
        if (curUser && curUser.username) {
          Log.info({
            logId,
            message: '获取用户信息成功 ' + JSON.stringify(curUser)
          });
          req.session.curUser = curUser;
          res.redirect(redirectURI);
          return;
        }
        Log.error({
          logId,
          message: '获取用户信息失败 ' + JSON.stringify(curUser)
        });
      } catch (err) {
        Log.error({
          logId,
          message: '获取用户信息失败 ' + Log.getErrorString(err)
        });
      }
    }

    req.session.redirectURI = req.query.redirectURI || req.session.redirectURI;
    res.redirect(sso_url(sso.client_id, sso.redirect_uri));
  };
};

module.exports.logout = function logout(req, res) {
  req.session.curUser = null;
  res.redirect(req.query.redirectURI || '/');
};

function sso_url(client_id, redirect_uri) {
  const sso_oauth_url = 'https://sso.bytedance.com/oauth2/authorize?' + querystring.stringify({
    client_id: client_id,
    access_type: 'online',
    response_type: 'code',
    redirect_uri: redirect_uri,
    scope: 'read',
    //state: base64.urlsafe_b64encode(JSON.stringify({ next: '/oauth2callback', platform: 'google' }))
  });
  console.log('sso_oauth_url', sso_oauth_url);
  return sso_oauth_url;
}

function get_sso_token(client_id, client_secret, redirect_uri, code, req, res) {
  return post({
    url: 'https://sso.bytedance.com/oauth2/access_token',
    data: {
      'code': code,
      'client_id': client_id,
      'client_secret': client_secret,
      'redirect_uri': redirect_uri,
      'grant_type': 'authorization_code'
    },
    timeout: 3000,
  }, {}, req, res);
}
