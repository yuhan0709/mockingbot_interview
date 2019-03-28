// server side
import Metrics from '@byted-service/metrics';

const metrics = new Metrics({
  host: process.env.NODE_ENV ? '127.0.0.1' : '10.8.125.131',
  port: 9123,
  defaultPrefix: 'fe.videoarch',
  bufferSize: 10,
  flushInterval: 3 * 1000
});
export default metrics;