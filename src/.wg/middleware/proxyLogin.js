const querystring = require('querystring');
const { get, post } = require('../../server/util/byted/request');
const Log = require('../../server/util/byted/log').default;
const sso = {
  client_id: '661c2c196bd11e785f10',
  client_secret: 'e038b4faf1fb2c4f5e1bd45d44727aac72c69a0c',
  redirect_uri: 'http://b-vadmin.bytedance.net/proxy_login'
};
module.exports = async function login(req, res) {
  const code = req.query.code;
  const logId = Log.genLogId(res);
  if (code) {
    try {
      const redirectURI = req.session && req.session.redirectURI || '/';
      const token = await get_sso_token(sso.client_id, sso.client_secret, sso.redirect_uri, code, req, res);
      const curUser = await get({ url: 'https://test-sso.bytedance.net/oauth2/userinfo', query: token, timeout: 3000 }, {}, req, res);
      if (curUser && curUser.username) {
        Log.info({
          logId,
          message: '获取用户信息成功 ' + JSON.stringify(curUser)
        });
        req.session.curUser = curUser;
        const newRedirectURI = `${redirectURI}${redirectURI.indexOf('?') > -1 ? '&' : '?'}user=${encodeURIComponent(JSON.stringify(curUser))}`;
        res.redirect(newRedirectURI);
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

function sso_url(client_id, redirect_uri) {
  const sso_oauth_url = 'https://test-sso.bytedance.net/oauth2/authorize?' + querystring.stringify({
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
    url: 'https://test-sso.bytedance.net/oauth2/access_token',
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
