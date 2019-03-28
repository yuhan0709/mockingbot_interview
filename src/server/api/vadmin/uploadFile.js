import { TosClient } from 'byted-tos-client';
import crypto from 'crypto';
import Log from '../../util/byted/log';
import { agentHost, isTCEProd } from '../../util/byted/env';

process.env.CONSUL_HTTP_HOST = agentHost;
const client = new TosClient({
  bucket: 'vcloud', // must have
  accessKey: !isTCEProd ? 'IEO4ZVRRAUIJADXZCK6E' : 'X298R8OU3HQHIYRM203W', // must have
  timeout: 10, // optional, 10 is default
  cluster: 'default', // optinal, 'default' is default
  service: 'toutiao.tos.tosapi' // optional, 'toutiao.tos.tosapi' is default
});

const cdnUrl = 'https://lf1-xgcdn-tos.pstatp.com/obj/vcloud/';

const uploadStatus = {
  EXISTED: 'EXISTED',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  TIMEOUT: 'TIMEOUT'
};

async function checkFileExisted(fileName) {
  try {
    const info = await client.getFileInfo(fileName);
    if (!info.size){
      return uploadStatus.FAILED;
    }
    // console.log('info:\n\n\n\n',info);
    return uploadStatus.EXISTED;
  } catch (e) {
    return e;
  }
}

async function sendFile(name, fileBuffer, config = { force: false }, $req, $res) {
  const dataHash = await getHash(fileBuffer);
  const newName = name.replace(/(\.\w+?)$/, `.${dataHash}$1`);
  if (!config.force) {
    const res = await checkFileExisted(newName);
    if (res === uploadStatus.EXISTED) {
      return { status: uploadStatus.EXISTED, filepath: cdnUrl + newName };
    }
  }
  try {
    await client.uploadFileBuf(newName, fileBuffer);
    return { status: uploadStatus.SUCCESS, filepath: cdnUrl + newName };
  } catch (err) {
    Log.error({
      logId: Log.genLogId($res),
      message: `upload file error ${Log.getErrorString(err)}`
    });
    return { status: uploadStatus.FAILED, err: String(err) };
  }
}
function getHash(buffer) {
  return new Promise(async (reslove, reject) => {
    const hash = crypto.createHash('md5');
    hash.on('readable', () => {
      const data = hash.read();
      if (data) {
        const dataHash = data.toString('hex');
        reslove(dataHash);
      }
      reject();
    });
    hash.write(buffer, () => {
      hash.end();
    });
  });
}


export async function uploadImage(fileName, data, config = {}, $req, $res) {
  const {
    timeout = 10000
  } = config;
  const base64 = data.replace(/^data:image\/\w+;base64,/, '');
  const fileBuffer = Buffer.from(base64, 'base64');
  const timeOut = new Promise((resolve) => setTimeout(() => { resolve({ status: uploadStatus.TIMEOUT }); }, timeout));
  return Promise.race([timeOut, sendFile(`vadmin/${fileName}`, fileBuffer, config, $req, $res)]);
}