import mysql from 'mysql';
import getHost from '../../../../../util/host';
import moment from 'moment';
import { UpdateTagsV2 } from '../../enhance';
import { isTCEProd } from '../../../../../util/byted/env';
let connection;

const prefix = isTCEProd ? '__temporary_' : '';
const user = isTCEProd ? 'cloud_admin_w' : 'videocloudaud_w';
const password = isTCEProd ? 'RKZXBEqEnnGiCGp_ljSuTXMLFhXnbEna' : 'yc67ge0AU50EQkG_mSujuiaXnQ68pL1J';
const database = isTCEProd ? 'cloud_admin' : 'videocloudaudit';
const getConnection =  async () => {
  const [host, port] = (await getHost['mysql']()).split(':');
  connection = mysql.createConnection({  // 应该是链接数据库
    host,
    port,
    user,
    password,
    database,
  });
  connection.connect();
};

export default {
  // 查看工单状态。
  GetStatusByService: params => {
    return new Promise( async (resolve, reject) => {
      if (!connection || connection.state == 'disconnected') {  //判断是都有链接
        await getConnection();
      }
      connection.query('select status, create_time, update_time, refuse_reason, details from ' + prefix + 'audit where service = '
                + connection.escape(params.Service)  // 查询数据库
                // connection.escape是为了防止sql注入，先将参数进行转义
                + ' and idx_user_id = '
                + connection.escape(params.AccountId), function (error, results) {
        if (error) {
          reject(error);
        } else {
          resolve({
            ResponseMetadata: true,
            Result: {
              Status: results.length ? ['通过', '未通过', '待审核'][results[0].status] : '工单不存在',
              RefuseReason: results.length && results[0].status == 1 ? results[0].refuse_reason : '',
              CreateTime: results.length ? results[0].create_time : '',
              UpdateTime: results.length ? results[0].update_time : '',
              Details: results.length ? results[0].details : ''
            }
          });
        }
      });
    });
  },

  // 如果工单不存在，创建它，存在修改他
  CommitAudit: params => {
    return new Promise( async (resolve, reject) => {
      if (!connection || connection.state == 'disconnected') {
        await getConnection();
      }
      connection.query('select status from ' + prefix + 'audit where service = '
                + connection.escape(params.Service)
                + ' and idx_user_id = '
                + connection.escape(params.AccountId), function (error, results) {
        if (error) {
          reject(error);
        } else {
          if (!results.length) {
            const now = moment();
            connection.query('INSERT INTO `' + prefix + 'audit` (`idx_user_id`, `user_name`, `status`, `details`, `create_time`, `update_time`, `service`) VALUES ('
                            + connection.escape(params.AccountId) + ', '
                            + connection.escape(params.Name) + ', '
                            + 2 + ', '
                            + connection.escape(JSON.stringify(params.Details)) + ', '
                            + connection.escape(now.format('YYYY-MM-DD HH:mm:ss')) + ', '
                            + connection.escape(now.format('YYYY-MM-DD HH:mm:ss')) + ', '
                            + connection.escape(params.Service) + ');', function (error) {
              if (error) {
                reject(error);
              } else {
                resolve({
                  ResponseMetadata: true,
                  Result: {
                    CreateTime: now.format('YYYY年MM月DD日 HH:mm:ss')
                  }
                });
              }
            });
          } else if (results[0].status === '0') {
            reject('工单已通过');
            // 工单未通过，修改工单。
          } else if (results[0].status === '1'){
            const now = moment();
            connection.query('update ' + prefix + 'audit set details='
                        + connection.escape(JSON.stringify(params.Details))
                        + ', status=\'2\', create_time='
                        + connection.escape(now.format('YYYY-MM-DD HH:mm:ss'))
                        + ' where service = '
                        + connection.escape(params.Service)
                        + ' and idx_user_id = '
                        + connection.escape(params.AccountId), function (error) {
              if (error) {
                reject(error);
              } else {
                resolve({
                  ResponseMetadata: true,
                  Result: {
                    CreateTime: now.format('YYYY年MM月DD日 HH:mm:ss')
                  }
                });
              }
            });
          } else {
            reject('工单已存在，审核中');
          }
        }
      });
    });
  },
  // 查询所有工单
  SelectAllByService: params => {
    return new Promise( async (resolve, reject) => {
      if (!connection || connection.state == 'disconnected') {
        await getConnection();
      }
      connection.query('select * from ' + prefix + 'audit where service = ' + connection.escape(params.Service) + ' order by create_time desc', function (error, results) {
        if (error) {
          reject(error);
        } else {
          results = results.map(res => {
            res.create_time = moment(res.create_time).format('YYYY-MM-DD HH:mm:ss');
            res.update_time = moment(res.update_time).format('YYYY-MM-DD HH:mm:ss');
            return res;
          });
          resolve({
            ResponseMetadata: true,
            Result: results
          });
        }
      });
    });
  },
  
  InsertAuditDetail: (params, $curUser, $req, $res) => {
    return new Promise( async (resolve, reject) => {
      if (!connection || connection.state == 'disconnected') {
        await getConnection();
      }
      let addTags = [], delTags = [], tag = { TagKey: 'ServiceOn', TagValue: params.service };
      if (params.status == 0) {
        addTags.push(tag);
      } else {
        delTags.push(tag);
      }
      const res = await UpdateTagsV2({
        addTags,
        delTags,
        AccountId: params.user_id,
      }, $curUser, $req, $res).catch(err => {
        reject(err);
      });
      if (!res[0].ResponseMetadata) {
        reject(res[0]);
      }
      reject = err => {
        if (params.status != 0) {
          delTags = [];
          addTags.push(tag);
        } else {
          addTags = [],
          delTags.push(tag);
        }
        UpdateTagsV2({
          addTags,
          delTags,
          AccountId: params.user_id,
        }, $curUser, $req, $res);
        reject(err);
      };
      connection.beginTransaction(function(err) {
        if (err)
          reject(err);
        else
          connection.query('update ' + prefix + 'audit set status='
              + connection.escape(params.status)
              + ', update_time='
              + connection.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
              + ', refuse_reason='
              + connection.escape(params.refuse_reason)
              + ' where id = '
              + connection.escape(params.idx_audit_id), function (error) {
            if (error)
              connection.rollback(function() {
                reject(error);
              });
            else
              connection.query('INSERT INTO `' + prefix + 'audit_detail` (`refuse_reason`, `description`, `create_time`, `status`, `user_name`, `idx_audit_id`, `user_id`, `details`) VALUES ('
                + connection.escape(params.refuse_reason) + ', '
                + connection.escape(params.description) + ', '
                + connection.escape(moment().format('YYYY-MM-DD HH:mm:ss')) + ', '
                + connection.escape(params.status) + ', '
                + connection.escape($curUser.name) + ', '
                + connection.escape(params.idx_audit_id) + ', '
                + connection.escape($curUser.id) + ', '
                + connection.escape(params.details) + ');', function (error, results) {
                if (error) {
                  connection.rollback(function() {
                    reject(error);
                  });
                } else {
                  connection.commit(function(err) {
                    if (err) {
                      connection.rollback(function() {
                        reject(err);
                      });
                    } else {
                      resolve({
                        ResponseMetadata: true,
                        Result: results
                      });
                    }
                  });
                }
              });
          });
      });
    });
  },
  SelectAuditDetailByAuditId: params => {
    return new Promise( async (resolve, reject) => {
      if (!connection || connection.state == 'disconnected') {
        await getConnection();
      }
      connection.query('select * from ' + prefix + 'audit_detail where idx_audit_id = ' + connection.escape(params.idx_audit_id) + ' order by create_time desc', function (error, results) {
        if (error) {
          reject(error);
        } else {
          results = results.map(res => {
            res.create_time = moment(res.create_time).format('YYYY-MM-DD HH:mm:ss');
            return res;
          });
          resolve({
            ResponseMetadata: true,
            Result: results
          });
        }
      });
    });
  },
};