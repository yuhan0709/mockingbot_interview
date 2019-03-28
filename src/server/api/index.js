import { get } from './public/request';
export function getMockData() {
  return {
    path: process.cwd()
  };
}

function getSomeData({ url = '',$req, $res }) {
  return get({
    url
  },{}, $req, $res);
}

const Apis = {
  getMockData,
  getSomeData
};
export const exec = function (key, ...params) {
  return Apis[key](...params);
};