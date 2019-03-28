import { getRbacPermissionInfo } from '../../server/api/public/user';
const authMap = {
  '质量平台': 'Basic BNfg_6voUzfIMgXpJR9RLXBL2qbwHLRW'
};
const authKeys = Object.keys(authMap);
function checkAuth(authorization) {
  for (const key of authKeys) {
    if (authorization === authMap[key]) {
      return key;
    }
  }
  return false;
}
export default async function(req, res) {
  res.type('json');
  if (req.method === 'GET') {
    const appName = checkAuth(req.headers.authorization);
    if (req.headers && appName) {
      if (req.query) {
        if (!req.query.email) {
          res.status(400);
          res.send({ message: 'query.email is require' });
          return;
        }
        try {
          const response = await getRbacPermissionInfo(appName, { email: req.query.email }, req, res, true);
          res.send(response);
          return;
        } catch (e) {
          console.log(e);
          res.status(500);
          res.send({});
          return;
        }
      }
    } else {
      res.status(401);
      res.send({ message: 'auth error' });
      return;
    }
  } else {
    res.status(405);
    res.send({ message: 'only get is support' });
    return;
  }
}