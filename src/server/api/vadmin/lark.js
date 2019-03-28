import Request from '../public/request';
import metrics from '../../util/byted/metrics';
import RedisGroup from '../../util/redisGroup';

const { postJSON } = Request;
// redis名称缓存时间 单位s
const nameEx = 60 * 60 * 24 * 7;
const host = 'https://oapi.zjurl.cn/open-apis/api';
const robotToken = 'b-8130af85-6d00-4753-aa52-8bdde223a7b4';
const getUserIdBeginCount = 'getuserid.begin';
const getUserIdLarkCount = 'getuserid.lark';
const getUserIdRedisCount = 'getuserid.redis';
const getUserIdErrorCount = 'getuserid.error';

export async function getUserId(email) {
  metrics.emitCounter(getUserIdBeginCount, 1);
  try {
    const redisRes = await RedisGroup.userInfo.get(`userInfo_${email}`);
    if (redisRes) {
      metrics.emitCounter(getUserIdRedisCount, 1);
      const res =  JSON.parse(redisRes);
      res.email = email;
      return res;
    }
    const res = await postJSON({
      url: `${host}/v1/user.user_id`,
      data: {
        token: robotToken,
        email
      }
    });
    res.email = email;
    metrics.emitCounter(getUserIdLarkCount, 1);
    RedisGroup.userInfo.set(`userInfo_${email}`, JSON.stringify(res), 'EX', nameEx);
    return res;
  } catch (e) {
    metrics.emitCounter(getUserIdErrorCount, 1);
  }
}

export function getUsersInfo(emails) {
  return Promise.all(emails.map(getUserId));
}

export function robotSendMessage({ email, text = '', title = '' }) {
  return postJSON({
    url: `${host}/v2/message/private_chat`,
    data: {
      token: robotToken,
      email,
      msg_type: 'post',
      content: {
        text,
        title,
      }
    }
  });
}

export function addChatMember({ chatId, userIds }) {
  return postJSON({
    url: `${host}/v2/chat/member/add`,
    data: {
      token: robotToken,
      chat_id: chatId,
      user_ids: userIds,
    }
  });
}

