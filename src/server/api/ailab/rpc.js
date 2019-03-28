import Consul from '@byted-service/consul';
import Thrift from '@byted-service/thrift';
import { hasConsul } from '../../util/byted/env';

const thriftFile = __dirname + '/keyphrase_service_biz.thrift';
const service = Thrift.load(thriftFile).KeyphraseService;

async function findService(){
  const options = {
    host: hasConsul ? '127.0.0.1' : '10.8.127.235',
    port: 2280
  };
  const consul = new Consul(options);
  const randomAddress = await consul.random('data.lab.keyphrase_general', {
    env: 'prod',
    cluster: 'default'
  });
  return randomAddress;
}
// extractKeyWords({
//   content: '```mixin-react↵const { BytedReactXgplayer } = Wg ↵let configXgMp4 = {↵  url: [{src: \'http://h5player.bytedance.com/video/music/audio.mp3\', name: \'林宥嘉·脆弱一分钟\', poster: \'http://h5player.bytedance.com/video/music/poster-small.jpeg\'}],↵  volume:1↵};↵↵return (↵   <div>↵       <BytedReactXgplayer↵          config={configXgMp4}↵          format={\'music\'}↵        />↵   </div>↵);↵```',
//   count: 5,
//   title: '播放器'
// });
export async function extractKeyWords(payload = {}){
  try {
    const { host, port } = await findService();
    const client = service.createClient({ host, port, timeout: 3000 });
    const rst = await client.extract({
      ...payload,
      req_type: 2,
      caller: 'videoarch'
    });
    console.log('rst\n\n\n\n\n\n\n\n',rst);
    if (rst.err_msg) return Promise.reject(new Error(rst.err_msg));
  } catch (e) {
    return Promise.reject(e);
  }
}
