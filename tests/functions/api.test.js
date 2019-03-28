import VadminParams from './params';
import VadminSchema from './schemas';
import VadminRequest from '../../src/server/api/vadmin/request';
// import { matchers } from 'jest-json-schema';
import { extendExpect } from 'byted-easy-api';

extendExpect(expect);
describe('开放平台后台 接口测试', () => {
  VadminParams.forEach(testObj=>{
    const { Action, params } = testObj;
    if (VadminSchema[Action] && VadminRequest[Action]) {
      it(Action,async (done) =>{
        const schema = VadminSchema[Action];
        const res = await VadminRequest[Action](...params);
        expect(res).toMatchSchema(schema,Action);
        done();
      });
    }
  });
});