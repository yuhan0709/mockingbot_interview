import React from 'react';
import Pages, { DEFAULT_PATH, ROOT_PATH } from './pages';
import Page from './component/Page';
import configureStore from '../../public/util/configureStore';
import reducers from './redux/reducers';
import './global.less';
import actions from './redux/actions';
import renderSSR from '@util/ssr';
import Request from '../../server/api/public/request';

const { get } = Request;
const config = {
  initPath: DEFAULT_PATH,
  root: ROOT_PATH,
  title: 'webgenerator',
};
async function getSSRProps({ req }) {
  const json = await get({ url: 'https://mock.bytedance.net/mock/5b10e1664bf42401b1233159/api/GetDocument' });
  // 每次都生成一个独立的store
  const { store } = configureStore({
    initialState: { apiData: json },
    reducers,
    actions
  });
  return {
    url: req.url,
    store,
    children: <Page pages={Pages} config={config} />
  };
}
renderSSR('webgenerator', getSSRProps);
