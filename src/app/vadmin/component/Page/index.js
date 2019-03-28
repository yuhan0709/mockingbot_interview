import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout, Dropdown, Menu as AntdMenu, Modal } from 'antd';
import style from './layout.less';
import Menu from '@component/Menu';
import Route from '@component/Route';
import Link from '@component/Link';
import Breadcrumbs from '@component/Breadcrumbs';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import UserActions from '../../redux/actions/User';
import { withRouter } from 'react-router';
import { hot } from 'react-hot-loader';

const { Header, Content, Sider } = Layout;

function logout() {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://sso.bytedance.com/api/v1/be/logout';
  document.body.appendChild(iframe);
  return new Promise((resolve) => {
    iframe.onload = () => {
      location.assign('/logout');
      resolve();
    };
  });
}
function clickLogout() {
  Modal.confirm({
    title: '退出确认',
    content: '确定要退出登录吗？',
    onOk: logout,
  });
}
const userMenu = (
  <AntdMenu theme="dark">
    <AntdMenu.Item>
      <Link to="/app/rbac/app/">权限控制</Link>
    </AntdMenu.Item>
    <AntdMenu.Item>
      <a onClick={clickLogout}>退出登录</a>
    </AntdMenu.Item>
  </AntdMenu>
);

function EmptyPage() {
  return <Layout className={style.empty}><h3>暂无后台权限，请查看<a href="https://bytedance.feishu.cn/space/doc/doccn2jKqhh0zloMLlYu9t" target="_blank" rel="noopener noreferrer">权限文档</a></h3></Layout>;
}

@withRouter
@connect((state) => {
  return {
    user: state.User.Info,
  };
}, (dispatch) => ({
  actions: bindActionCreators(UserActions, dispatch),
}))
class Page extends Component {
  constructor(props) {
    super(props);
    this.props.actions.getUser();
  }
  render() {
    const {
      pages = {},
      config: projectConfig = {}
    } = this.props;
    const hasPage = Object.keys(pages).length > 0;
    return (
      <Layout className={style.container}>
        {
          hasPage ? <Sider className={style.sider} theme="dark">
            <div className={style.title}>开放平台后台</div>
            <Menu
              pages={pages}
              config={projectConfig}
              menuProps={{ theme: 'dark' }}
            />
          </Sider> : null
        }
        <Layout>
          {
            hasPage ? <Header className={style.header}>
              <div style={{ flexGrow: 1 }} />
              <div className={style.rightmenu}>
                <Dropdown overlay={userMenu}><a>{this.props.user.name || '未登录'}</a></Dropdown>
              </div>
            </Header> : <Header className={style.header}>
              <div className={style.title}>开放平台后台</div>
              <div className={style.rightmenu}>
                <a>{this.props.user.name || '未登录'}</a>
              </div>
            </Header>
          }

          {
            hasPage ?
              <Layout className={style.layout}>
                <Breadcrumbs pages={pages} config={projectConfig} />
                <Content className={style.content}>
                  <Route pages={pages} config={projectConfig} />
                </Content>
              </Layout>
              : <EmptyPage />
          }
        </Layout>
      </Layout>
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
};

export default hot(module)(Page);
