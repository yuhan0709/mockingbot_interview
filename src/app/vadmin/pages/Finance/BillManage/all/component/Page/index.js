import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defaultMergeProps } from 'react-redux/lib/connect/mergeProps';
import { bindActionCreators } from 'redux';
import UserActions from '../../redux/actions/user';
import { Layout } from 'antd';
import style from './layout.less';
import { projectTitle, projectIcon } from '../../../../.wg/projectConfig';
import Menu from '@component/ConsoleProjectMenu';
import Route from '@component/Route';
import ConsoleFramework from '@component/ConsoleFramework';

const { Content } = Layout;

@connect((state) => ({
  publicConfig: state.Config.publicConfig,
  projectConfig: state.Config.projectConfig
}), (dispatch) => ({
  actions: bindActionCreators(UserActions, dispatch)
}), defaultMergeProps, {
  pure: false,
})
class Page extends Component {
  render() {
    const {
      pages = {},
      config = {},
      actions = {},
      publicConfig,
    } = this.props;
    const content = <Layout className={style.container}>
      <Layout>
        <Menu
          title={projectTitle}
          icon={projectIcon}
          pages={pages}
          config={config}
        />
        <Layout className={style.layout}>
          <Content className={style.content}>
            <Route pages={pages} config={config} />
          </Content>
        </Layout>
      </Layout>
    </Layout>;
    try {
      if (publicConfig.SSR) {
        return (content);
      }
    } catch (e) {
      console.log(e);
    }
    return (
      <ConsoleFramework
        getUser={actions.setUser}
        serviceOpen
        publicConfig={publicConfig}
      >
        {content}
      </ConsoleFramework>
    );
  }
}
Page.defaultProps = {
  pages: {},
  config: {
    initPath: '/',
    root: '/',
    title: 'webgenerator'
  },
};
Page.propTypes = {
  pages: PropTypes.object,
  config: PropTypes.shape({
    initPath: PropTypes.string,
    root: PropTypes.string,
    title: PropTypes.string.isRequired,
    style: PropTypes.object,
  }),
  actions: PropTypes.shape({
    setUser: PropTypes.func
  })
};

export default Page;
