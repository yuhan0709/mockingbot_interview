import Log from '../../server/util/byted/log';
import getConfigs from '../../server/api/public/publicConfig';

const MountPlace = '<div id=\'root\'>';

/**
 * entryHtml中间件
 * 用于转发页面请求、服务端渲染
 */
export default (app) => (async function (req, res, body) {
  const config = await getConfigs(req, res);
  body = body.replace('<body>', `
    <body>
      <script>
        window.INIT_CONFIG = ${JSON.stringify(config)}
      </script>
  `);
  for (const appKey of Object.keys(app)) {
    const entryHtml = app[appKey].entryHtml.replace(/^\.\/src/, '');
    const {
      matchPaths = [entryHtml],
      whiteList = [],
    } = app[appKey];
    // 当请求参数命中app路径 且不在白名单中时 转发至该页面
    if ((matchPaths.some((pathRe) => !!req.originalUrl.match(pathRe)) && !whiteList.some(re => !!req.originalUrl.match(re)))) {
      let ssr = undefined;
      let mountPlace = app[appKey].mountPlace || MountPlace;
      // 引入渲染ssr的dom结构 出错则不会进行ssr
      if (app[appKey].ssrEntry && process.env.NODE_ENV) {
        try {
          // 引入这个包之后 渲染函数会注入global.SSR[appKey]
          if (!global._SSR_ || !global._SSR_[appKey]) {
            const ssrEntry = app[appKey].ssrEntry.replace('./src/app/', '');
            require(`../../resource/app/${ssrEntry}`);
          }
          const renderSSR = global._SSR_[appKey];
          const frontComponents = await renderSSR({ req, res });
          ssr = `${mountPlace}${frontComponents}`;
        } catch (e) {
          Log.error({
            logId: Log.genLogId(res),
            message: `ssr error ${Log.getErrorString(e)}`
          });
        }
      }
      if (ssr) return body.replace(mountPlace, ssr).replace(/<link href=".+?.css" rel="stylesheet"><\/head>/, '<link href="/static/css/app/webgenerator/ssr.css" rel="stylesheet"></head>');
    }
  }
  return body;
});
