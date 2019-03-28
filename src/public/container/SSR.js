import React, { PureComponent } from 'react';
// PureComponent简化了要render操作的次数，从而提高性能。
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { LocaleProvider } from 'antd';

class SSR extends PureComponent {
  render() {
    return (
      <LocaleProvider locale={zhCN}>
        <Provider store={this.props.store}>
          <StaticRouter location={this.props.url} context={{}}>
            {
              this.props.children
            }
          </StaticRouter>
        </Provider>
      </LocaleProvider>
    );
  }
}
SSR.propTypes = {
  store: PropTypes.object,
  url: PropTypes.string
};

export default SSR;
