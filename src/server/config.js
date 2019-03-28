import path from 'path';

process.env.PROJCET_PSM = 'fe.videoarch.vadmin';
process.env.VPROJCET = process.env.PROJCET_PSM.split('.')[2];
export default {
  isDebug: !process.env.NODE_ENV,
  requireNode: {
    isDebug: !process.env.NODE_ENV,
    base: path.resolve(__dirname, 'api'),
    inject: req => ({ $curUser: req.session && req.session.curUser }),
    //api调用前钩子（注意：此钩子在服务器端执行）
    resolve: (req, moduleName, functionName, formalParams, actualParams) => {
      console.log(moduleName, functionName, '形式参数:', formalParams, '实际参数:', actualParams);
      if (req.session && req.session.curUser ||
                (!formalParams.find(i => i === '$curUser') && !actualParams.find(i => i === '$curUser'))) {
        return true;
      } else {
        throw { statusCode: 401, message: 'Need Login' };
      }
    },
    //api调用后失败钩子（注意：此钩子在浏览器端执行）
    reject: err => {
      if (err.statusCode === 401) {
        window.location.href = '/login?redirectURI=' + encodeURIComponent(window.location.href);
      }
      throw err;
    }
  },

  node: {
    port: 3000,
    sessionStore: 'redis',
  },

  session: {
    esOptions: {
      cookie: { maxAge: 604800000 }
    }
  },

  redis: {
    host: '10.3.32.71',
    port: 3708,
    prefix: 'videoarch-fe',
    no_ready_check: true
  },
  // redis集群配置 参考 server/util/redisGroup.js
  redisGroup: {
    userInfo: {
      psm: 'toutiao.redis.vadmin_user_info'
    },
    permission: {
      psm: 'toutiao.redis.vadmin_permission'
    }
  },

  mysql: {
    host: '10.6.19.35',//consul:toutiao.mysql.testdb, consul查ip命令:sd lookup toutiao.mysql.testdb
    port: 3307,
    database: 'venus',
    user: 'venus_w',
    password: 'P6FUfLCFDt7w6aSN_VP0dWACov4bHYcK',
    debug: false,
    charset: 'UTF8_GENERAL_CI',
    multipleStatements: true,
    connectionLimit: 10
  },

  secret: {
    key: 'lsh',
  },

  sso: {
    client_id: 'd3c4c51d037b6284c96b',
    client_secret: 'b4c0cd7043e4705d52384183a026c427b439d1d8'
  }
};
