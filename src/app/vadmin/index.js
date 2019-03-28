import React from 'react';
import ReactDOM from 'react-dom';
import Pages, { DEFAULT_PATH, ROOT_PATH } from './pages';
import Root from '../../public/container/Root';
import Page from './component/Page';
import './global.less';
import { store, history } from './store';
import { message } from 'antd';

message.config({
  maxCount: 2,
});

if (module.hot) {
  module.hot.accept();
}


import favicon from './static/icon/favicon.png';

const link = document.createElement('link');
link.rel = 'icon';
link.href = favicon;
document.querySelector('head').appendChild(link);

const config = {
  initPath: DEFAULT_PATH,
  root: ROOT_PATH,
  title: 'webgenerator',
  forceTrailingSlash: true,
};

ReactDOM.render(
  <Root
    store={store}
    history={history}
    pages={Pages}
    config={config}
  >
    <Page pages={Pages} config={config}/>
  </Root>, document.getElementById('root'));

