import '@byted/nemo';
import entryHtml from './middleware/entryHtml';
import path from 'path';
import { login, logout } from './middleware/auth';
import loginProxyMiddleware from './middleware/proxyLogin';
import { GetStatusByService, CommitAudit } from './middleware/audit';
import { uploadProducts } from './middleware/upload';
import rootRedirect from './middleware/root';
import loginCheck from './middleware/loginCheck';
import Log, { loggerConfig } from '../server/util/byted/log';
import { isTCEProd, isStaging, isTest } from '../server/util/byted/env';
import getPermission from './middleware/getPermission';
import { proxyLogin } from '@byted/vcloud-util';
import oldUrlRedirect from './middleware/oldUrlRedirect';
import { logger } from '@fe/middlewares';
import bodyParser from 'body-parser';
import { DownloadCsv } from './middleware/download';

function exitHandler(options, exitCode) {
  if (options.cleanup) {
    Log.error({
      message: 'clean(reload) process'
    }, {
      errorLevel: 'CRITICAL'
    });
  }
  if (exitCode || exitCode === 0) {
    Log.error({
      message: `error happend in process，err：${Log.getErrorString(exitCode)}`
    }, {
      errorLevel: 'CRITICAL'
    });
  }
  if (options.exit) process.exit();
}
const app = {
  'vadmin': {
    entryHtml: './src/app/vadmin/index.html',
    entryJs: './src/app/vadmin/index.js',
    matchPaths: [/^\/app/],
    whiteList: [/^\/static/, /^\/require-node/, /\/index.html$/, /^\/ip/, /^\/login/, /^\/logout/],
  },
};
let sso = {
  client_id: isTCEProd ? 'd3c4c51d037b6284c96b' : 'dd8facbc12a7ca1b19fb',
  client_secret: isTCEProd ? 'b4c0cd7043e4705d52384183a026c427b439d1d8' : '755d855fea500ec9241584e63db6c0f0deff0373'
};
if (process.env.TCE_PSM === 'fe.videoarch.vadminbeta2') {
  sso = {
    client_id: 'd4012b7208884a1b0784',
    client_secret: 'cdf944eef1edb167e408eef256e8fa149a7c9a22'
  };
}
const sessionMaxAge = 365 * 24 * 60 * 60 * 1000;
const sessionRedis = (!isTCEProd && !isStaging) ? {
  host: '10.225.68.161',
  port: 3833,
  prefix: 'videoarch-fe-vadmin',
  no_ready_check: true
} : {
  host: '10.3.32.71',
  port: 3708,
  prefix: 'videoarch-fe-vadmin',
  no_ready_check: true
};
export default {
  app,
  server: {
    port: 3000,
    sessionStore: 'redis',
    session: {
      esOptions: {
        cookie: { maxAge: sessionMaxAge }
      }
    },
  },
  expressMiddleware: (chain, { server,isDebug }) => {
    chain.before('header').use(logger(loggerConfig));
    // 自定义
    chain.before('header').use(logger(loggerConfig));
    chain.before('header').use(bodyParser.json({ limit: '800mb' }));
    chain.before('header').use(bodyParser.urlencoded({ extended: true }));

    chain.middleware('entry').use(entryHtml({
      outdir: process.cwd(),
      port: server.port,
      app
    }));

    chain.after('session').use('/', rootRedirect);
    chain.after('session').use('/audit/GetStatusByService', GetStatusByService);//uploadProducts
    chain.after('session').post('/audit/CommitAudit', CommitAudit);
    chain.before('entry').post('/upload/products', uploadProducts);
    chain.before('entry').use('/downloadCsv', DownloadCsv);
    // 在测试环境启动代理登录接口
    if (isTest) {
      chain.before('entry').use('/proxy_login', loginProxyMiddleware);
    }
    chain.before('entry').use(loginCheck({ sso }));
    chain.before('entry').use(oldUrlRedirect);
    chain.middleware('login').use('/login', login({ sso }));
    chain.middleware('logout').use('/logout', logout);
    chain.before('session').use('/api/permission', getPermission);
    // 测试环境假登录
    if (isDebug){
      chain.middleware('login').use('/login',proxyLogin);
    }
  },
  chainWebpack: (chain) => {
    // config 是 ChainableConfig 的一个实例
    chain.module
      .rule('lib-css')
      .include.add(path.resolve(__dirname, '../../node_modules/tui-editor')).end()
      .include.add(path.resolve(__dirname, '../../node_modules/codemirror')).end()
      .include.add(path.resolve(__dirname, '../../node_modules/highlight.js')).end()
      .include.add(path.resolve(__dirname, '../../lib')).end();

    chain.module
      .rule('image')
      .include.add(path.resolve(__dirname, '../../node_modules/tui-editor')).end()
      .include.add(path.resolve(__dirname, '../../lib')).end();
  },
  // redis集群配置
  redisGroup: {
    userInfo: {
      psm: 'toutiao.redis.vadmin_user_info'
    },
    permission: {
      psm: 'toutiao.redis.vadmin_permission'
    }
  },
  sso,
  exitHandler,
  redis: sessionRedis,
};