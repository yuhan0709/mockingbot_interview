import Request from '../../../../server/api/public/request';

const { get } = Request;
export function getData() {
  return async (dispatch) => {
    const res = await get({ url: 'https://mock.bytedance.net/mock/5b10e1664bf42401b1233159/api/GetDocument' });
    dispatch(setData(res));
  };
}
// react-promise-middle(类似～)
export function setData(payload) {
  return {
    type: 'SET_API_DATA',
    payload    // payload: 表示获取到的交互数据。
  };
}
export default {
  getData,
  setData,
};
