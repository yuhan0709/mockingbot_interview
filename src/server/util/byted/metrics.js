// server side
import Metrics from '@byted-service/metrics';
import { agentHost } from './env';

const metrics = new Metrics({
  host: agentHost,
  port: 9123,
  defaultPrefix: process.env.PROJCET_PSM,
  bufferSize: 10,
  flushInterval: 3 * 1000
});
export default metrics;
