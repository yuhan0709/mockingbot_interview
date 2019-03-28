import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { LocaleProvider } from 'antd';
import Navigate from '../util/navigate';


class Root extends Component {
  componentDidMount() {
    Navigate.setHistory(this.props.history);
    Navigate.setRoot((this.props.config && this.props.config.root) || '/app');
  }
  render() {
    return (
      // 为文案提供国际化支持。
      <LocaleProvider locale={zhCN}>
        <Provider store={this.props.store}>
          <ConnectedRouter history={this.props.history}>
            {
              this.props.children
            }
          </ConnectedRouter>
        </Provider>
      </LocaleProvider>
    );

  }
}

Root.defaulProps = {
  store: {},
  history: {},
  pages: {},
  config: {},
  children: null
};
Root.propTypes = {
  store: PropTypes.object,
  history: PropTypes.object,
  pages: PropTypes.object,
  config: PropTypes.object,
  children: PropTypes.element
};
export default Root;