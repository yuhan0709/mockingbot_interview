import request from 'request';
import path from 'path';
import fs from 'fs';
import SSR from './ssr';
import Log from '../../server/util/byted/log';

/**
 * entryHtml中间件
 * 用于转发页面请求、服务端渲染
 */
export default ({ outdir,port,app }) => (async function (req, res, next) {
  Log.info({
    logId: Log.genLogId(res),
    message: `req.originalUrl ${req.originalUrl}`
  });
  for (const appKey of Object.keys(app)) {
    const entryHtml = app[appKey].entryHtml.replace(/^\.\/src/, '');
    const {
      matchPaths = [entryHtml],
      whiteList = [],
    } = app[appKey];
    // 当请求参数命中app路径 且不在白名单中时 转发至该页面
    if ((matchPaths.some((pathRe) => !!req.originalUrl.match(pathRe)) && !whiteList.some(re => !!req.originalUrl.match(re)))) {
      if (process.env.NODE_ENV) {
        const entry = path.join(outdir,'/resource/',entryHtml);
        const file = fs.readFileSync(entry, { encoding: 'utf-8' });
        const ssrBody = await SSR(app)(req, res, file);
        res.send(ssrBody);
      } else {
        request('http://127.0.0.1:' + port + entryHtml, async (err, response, body) => {
          if (err) res.send(500, err);
          else {
            const ssrBody = await SSR(app)(req, res, body);
            res.send(ssrBody);
          }
        });
      }
      return;
    }
  }
  next();
});
