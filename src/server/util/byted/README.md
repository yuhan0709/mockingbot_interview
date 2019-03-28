# 公司ms平台接入说明
可以参考玉北的docs[QS 框架接入 MS 平台的工作](https://docs.bytedance.net/doc/opTvz5DIKHOT7NXaCAcrMb)
## Log
标准日志，主要有业务日志、access日志、call日志等类型。
完成接入之后业务方只需要关系业务日志即可。

### access日志
服务被调用的日志，由`@fe/middleware`的logger中间件提供。
需要在server/index.js中引用logger中间件并使用。另外需要注意的是，为保证access日志的行为(是否stdout，是否生成文件，文件生成位置等)与业务日志、call日志一致，需要从`public/util/byted/log`中引用`loggerConfig`用于初始化logger中间件。
```
import { logger } from '@fe/middlewares';
import Log, { loggerConfig } from '../public/util/byted/log';
...
app.use(logger(loggerConfig));

```

### call日志
call日志是调用下游服务的日志，由node使用的请求模块自行打印(如本目录下的request.js)。
建议各业务方直接使用request.js，保证call日志效果。

### 业务日志
可以使用log模块的info方法和error方法。具体参数可以参考注释。
调用业务日志时需要注意两个参数，logId，message。
**logId**
logId即日志Id，可以使用日志模块的`genLogId`方法生成。
`genLogId`方法接受一个参数，为express的res对象。`genLogId`会尝试从这个res对象的header中读取logId(x-tt-logid)，如果没有就自己生成一个，并写入res对象。`@fe/middleware`的logger中间件会在接到请求时生成logId，后续的下游调用以及业务日志都应该沿用这个logId用于排查问题。
**message**
message为业务日志的内容，由业务方提供内容。需要注意的是，未防止业务日志太长影响排查问题，默认会启用对message的slice逻辑，默认长度为500。可以通过配置修改该行为。

## ms平台
ms平台是一个服务化管理平台，可以配置报警、监控、日志查看等功能。ms平台功能的实现是靠metrices系统和databus日志完成的。
使用上述的Log模块可以自动完成databus日志系统的接入。这里就不具体说明了。
ms平台的监控报警功能是由metrics系统实现的。metrics平台是一个埋点平台，通过配置特殊的埋点，可以实现ms平台的监控报警功能。具体可以参考[视频云MS平台接入记录](https://wiki.bytedance.net/pages/viewpage.action?pageId=226091120)。


接入ms平台主要有两类埋点，接口埋点、日志埋点。
**接口埋点**
参考 `msMetrics.js` 的 `api.success`与`api.error`两个方法。需要传入接口名以及调用时间(us)。配置正常后，可以在ms平台的接口监控中看到各个接口的情况。

**日志埋点**
参考 `msMetrics.js` 的 `log.throughput`方法。日志埋点实际上应该叫错误日志埋点。错误日志埋点会由Log.error自动打印，业务中需要注意的是，根据情况定义level。level取值有三种`WARNING` `ERROR` `CRITICAL`。可以通过Log.error的第二个参数配置该值。
```
// server/index.js
process.on('uncaughtException', (err) => {
  Log.error({
    message: `uncaughtException: ${Log.getErrorString(err)}`
  }, {
    errorLevel: 'CRITICAL'
  });
});
```