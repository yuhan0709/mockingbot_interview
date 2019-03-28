
// 下面这个作用是跟工单审核和状态有关的。

// 下面两行require是require-node进行交互。
const Apis = require('../../server/api/vadmin/request/apis/mysql');
const Log = require('../../server/util/byted/log').default;

function ErrorMeta(error) {
  return { ResponseMetadata: { Error: { Code: error, Message: error } } };
}
function notNull(params, res, ...keys) {
  for (let i = 0; i < keys.length; i++) {
    if (!params[keys[i]]) {
      res.status(500);
      res.send(ErrorMeta(keys[i] + '不能为空'));
      return false;
    }
  }
  return true;
}
module.exports.GetStatusByService = async (req, res) => {
  const logId = Log.genLogId(res);
  if (req.headers.authorization === 'Basic dmFkbWluOkhlbGxvV29ybGQ=') {
    if (!notNull(req.query, res, 'Service', 'AccountId')) {  //判断req.query.Service和req.query.AccountId是不是为空。
        return;
    }
    // 这个GetStatusByService应该就是server端的交互代码。
    const response =  await Apis.default.GetStatusByService(req.query).catch(error => {
      Log.error({
        logId,
        message: 'mysql读取GetStatusByService失败 ' + Log.getErrorString(error)
      });
      delete error.sql;
      delete error.sqlMessage;
      res.status(500);
      res.send(ErrorMeta(error));
    });

    res.status(200);
    res.send({ response });
  } else {
    res.status(500);
    res.send(ErrorMeta('authorization error'));
  }
};

module.exports.CommitAudit = async (req, res) => {
  const logId = Log.genLogId(res);
  if (req.headers.authorization === 'Basic dmFkbWluOkhlbGxvV29ybGQ=') {
    if (!notNull(req.body, res, 'Service', 'AccountId')) {
      return;
    }
    const response =  await Apis.default.CommitAudit(req.body).catch(error => {
      Log.error({
        logId,
        message: 'mysql执行CommitAudit失败 ' + Log.getErrorString(error)
      });
      res.status(500);
      delete error.sql;
      delete error.sqlMessage;
      res.send(ErrorMeta(error));
    });
    res.status(200);
    res.send({ response });
  } else {
    res.status(500);
    res.send(ErrorMeta('authorization error'));
  }
};

