/* eslint-disable no-console */
//import Apis from '../vadmin/request';
import { getAllAppPermission } from '../public/user';
import tcc from '@byted-service/tcc';

export let expenseConfig = {};
// 配置更新间隔 10秒
const timeout = 10000;
async function fetchVadminConfig() {
  try {
    //const res = await Apis.ListConst();
    const res = await tcc({
      serviceName: 'fe.videoarch.vadmin',
      key: 'expenseConfig',
      expires: 1
    });
    if (res) {
      expenseConfig = JSON.parse(res);
    }
  } catch (e){
    console.log(e);
  }
}
async function fetchConfigInfo() {
  await fetchVadminConfig();
}
fetchConfigInfo();
let fetchInter = null;
export default async function getConfigs(req, res) {
  if (!expenseConfig || Object.keys(expenseConfig).length === 0) await fetchConfigInfo();
  if (!fetchInter) fetchInter = setInterval(fetchConfigInfo, timeout);
  let permission = {};
  if (req && req.session && req.session.curUser) {
    permission = await getAllAppPermission(req.session.curUser, req, res);
  }
  return {
    permission,
    expenseConfig
  };
}