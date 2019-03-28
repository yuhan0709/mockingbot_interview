
const Apis = require('../../server/api/vadmin/request');
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

module.exports.DownloadCsv = async (req, res) => {
  const logId = Log.genLogId(res);
  if (!notNull(req.query, res, 'QueryParams')) {
    return;
  }
  try {
    const QueryParams = JSON.parse(req.query.QueryParams);
    const response = await Apis.default[QueryParams.funcName]({ ...QueryParams.params }, req.session.curUser, req, res);
    res.status(200);
    res.type('csv');
    res.send(response);
  } catch (error) {
    Log.error({
      logId,
      message: 'node导出失败 ' + Log.getErrorString(error)
    });
    res.status(500);
    res.send(ErrorMeta(error));
  }

};