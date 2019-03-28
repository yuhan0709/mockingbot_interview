const urlRedirect = [
  {
    re: /^\/app\/operate\/account\//,
    newUrl: '/app/user_center/account/'
  },
  {
    re: /^\/app\/edit\/top\//,
    newUrl: '/app/base/top/'
  },
  {
    re: /^\/app\/edit\/doc\//,
    newUrl: '/app/base/doc/'
  },
  {
    re: /^\/app\/manage\/product\//,
    newUrl: '/app/base/doc/'
  }
];
export default function(req, res, next) {
  let redirectUrl = '';
  const url = req.originalUrl || '';
  if (urlRedirect.some(redirect => {
    if (url.match(redirect.re)) {
      redirectUrl = url.replace(redirect.re, redirect.newUrl);
      return redirectUrl !== url;
    }
    return false;
  })) {
    res.redirect(redirectUrl);
    return;
  }
  next();
}