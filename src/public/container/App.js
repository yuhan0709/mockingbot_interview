import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import Router from './Router';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { LocaleProvider } from 'antd';


function App(props) {
  return (
    <LocaleProvider locale={zhCN}>
      <Provider store={props.store}>
        <ConnectedRouter history={props.history}>
          <Router pages={props.pages} config={props.config}/>
        </ConnectedRouter>
      </Provider>
    </LocaleProvider>
  );
}

App.defaulProps = {
  store: {},
  history: {},
  pages: {},
  config: {},
};
App.propTypes = {
  store: PropTypes.object,
  history: PropTypes.object,
  pages: PropTypes.object,
  config: PropTypes.object
};
export default App;