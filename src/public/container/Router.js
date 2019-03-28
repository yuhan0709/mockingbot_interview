import React, { Component } from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Menu, Layout, Breadcrumb } from 'antd';
import { Link } from '../component';
import Navigate from '../util/navigate';
import style from './layout.less';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const { Header, Sider, Content } = Layout;
const contentStyle = { background: '#fff', padding: 24, margin: 0 };

// TODO: remove later
import HeaderContent from '../../app/fe.videoarch.fcdn/pages/Header';

@withRouter
class Router extends Component {
  constructor(props, context) {
    super(props, context);
    this.routeList = [];
    this.menuItemKeys = {};
    this.subMenuKeys = {};
    this.state = {
      selectedKeys: [], // 当前选中的菜单项key数组
      openKeys: [],  // 当前展开的SubMenu菜单项key数组
    }; 
    Navigate.setHistory(this.props.history);
    Navigate.setRoot((this.props.config && this.props.config.root) || '/app');
  }
  // 三种情况下会调用UNSAFE_componentWillReceiveProps,官方建议：
  // static getDerviedStateFromProps方法。
  // 1、组建的props发生变化（初始化不会）
  // 2、父组件发生重新渲染，
  UNSAFE_componentWillReceiveProps(nextProps) {
    // 添加这个判断，减少页面回流
    if (this.props.location !== nextProps.location) {
      const {
        selectedKeys,
        openKeys,
      } = this.getMenuStat(nextProps.location.pathname);
      this.setState({
        selectedKeys,
        openKeys,
      });
    }
  }
  onTitleClick = ({ key }) => {
    // 如果需要展开的已经展开，就将它过滤掉
    // 如果需要展开的没展开，就把它添加到展开的数组
    let { openKeys = [] } = this.state;
    openKeys = openKeys.filter(k => key !== k);
    if (openKeys.length !== this.state.openKeys.length) {
      this.setState({
        openKeys
      });
    } else {
      openKeys.push(key);
      this.setState({
        openKeys
      });
    }
  }
  generatorRouteAndMenu(menuNode, key, parentPath = '') {
    const renderPath = parentPath.replace(/\/$/g, '') + '/' + key.replace(/^\//g, '');
    const children = menuNode.children || {};
    const subMenu = [];
    Object.keys(children).forEach(ckey => {
      // 为了生成route 无论是否Menu上显示 都需要递归调用一下
      const item = this.generatorRouteAndMenu(children[ckey], ckey, renderPath);
      if (!children[ckey].menuIgnore) subMenu.push(item);
    });
    // 副作用 生成路由
    if (menuNode.component) {
      this.routeList.push(<Route exact key={renderPath} path={renderPath} component={menuNode.component} />);
    }
    if (subMenu && subMenu.length > 0) {
      this.subMenuKeys[renderPath] = menuNode;
      return (
        <SubMenu key={renderPath} onTitleClick={this.onTitleClick} title={<span>{menuNode.name}</span>}>
          {
            subMenu
          }
        </SubMenu>
      );
    }
    if (!menuNode.menuIgnore) {
      this.menuItemKeys[renderPath] = menuNode;
      return <MenuItem key={renderPath}><Link to={renderPath}>{menuNode.name}</Link></MenuItem>;
    }
    return null;
  }
  // 获取Menu中可选中/可展开的父级
  getMenuStat(pathname) {
    const selectedKeys = [];
    const openKeys = [];
    const path = pathname.split('/');
    while (path.length > 0) {
      const nodeKey = path.join('/');
      if (this.menuItemKeys[nodeKey]) selectedKeys.push(nodeKey);
      if (this.subMenuKeys[nodeKey]) openKeys.push(nodeKey);
      path.pop();
    }
    return {
      selectedKeys,
      openKeys,
    };
  }
  componentDidMount() {
    // 初始化选中的路由
    const {
      selectedKeys,
      openKeys,
    } = this.getMenuStat(window.location.pathname);
    this.setState({
      selectedKeys,
      openKeys
    });
  }

// 页面导航说明
  generatorBreadcrumb() {
    const {
      location,
      pages,
      config,
    } = this.props;
    const paths = location.pathname.replace(config.root, '').split('/');
    const crumbList = [];
    let parent = pages;
    let nodePath = config.root;
    for (let i = 0, l = paths.length; i < l; i++ ) {
      if (!parent) break;
      const node = parent[paths[i]];
      if (node) {
        parent = node.children;
        nodePath += '/' + paths[i];
        if (this.menuItemKeys[nodePath])
          crumbList.push(<Breadcrumb.Item key={nodePath}><Link to={nodePath}>{node.name}</Link></Breadcrumb.Item>);
        else crumbList.push(<Breadcrumb.Item key={nodePath}>{node.name}</Breadcrumb.Item>);
      }
    }
    return crumbList;
  }
  render() {
    const {
      pages = {},
      config: projectConfig = {}
    } = this.props;
    const {
      root: rootPath = '/',
      initPath,
    } = projectConfig;
    const pageKeys = Object.keys(pages);
    const {
      selectedKeys,
      openKeys,
    } = this.state;
    // 重新计算路由表
    this.routeList = [];
    const menu = <Menu
      mode="inline"
      openKeys={openKeys}
      selectedKeys={selectedKeys}
    >
      {
        pageKeys.map(key => this.generatorRouteAndMenu(pages[key], key, rootPath))
      }
    </Menu>;
    return (
      <Layout className={style.container}>
        {/*// TODO: remove later*/}
        {/*<Header className="header" style={projectStyle.header}>*/}
        {/*<h1 style={projectStyle.headerText}>{projectConfig.title}</h1>*/}
        {/*</Header>*/}
        <Header className='header'>
          <HeaderContent />
        </Header>
        <Layout>
          <Sider width={200} style={{ background: '#fff' }}>{menu}</Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              {
                this.generatorBreadcrumb()
              }
            </Breadcrumb>
            <Content style={contentStyle}>
              <Switch>
                {
                  this.routeList
                }
                { initPath && initPath !== rootPath && <Redirect exact from={rootPath} to={initPath} />}
              </Switch>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}
Router.defaultProps = {
  pages: {},
  history: {},
  location: {},
  config: {
    initPath: '/',
    root: '/',
    title: 'webgenerator'
  },
};
Router.propTypes = {
  pages: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  config: PropTypes.shape({
    initPath: PropTypes.string,
    root: PropTypes.string,
    title: PropTypes.string.isRequired,
    style: PropTypes.object,
  }),
};

export default Router;
