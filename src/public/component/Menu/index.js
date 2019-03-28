/**
 * Menu组件
 * 通过输入pages配置，渲染出一个菜单。自带初始化菜单项，展开父级菜单等功能。
 * 可以通过配置renderSubMenu/renderMenuItem/menuProps渲染属于自己的菜单。
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Menu as AntdMenu } from 'antd';
import Link from '../Link';

const SubMenu = AntdMenu.SubMenu;
const MenuItem = AntdMenu.Item;
const NOOP = () => {};

function renderSubMenu(menuNode, renderPath, subMenu, manageOpenFunc = NOOP) {
  return (
    <SubMenu key={renderPath} onTitleClick={manageOpenFunc} title={<span>{menuNode.name}</span>}>
      {
        subMenu
      }
    </SubMenu>
  );
}
function renderMenuItem(menuNode, renderPath) {
  return <MenuItem key={renderPath}><Link to={renderPath}>{menuNode.name}</Link></MenuItem>;
}

@withRouter
class Menu extends Component {
  state = {
    selectedKeys: [],
    openKeys: [],
    menu: []
  }
  menuItemKeys = {}
  subMenuKeys = {}
  UNSAFE_componentWillMount() {
    this.getMenu();
    // 初始化选中的路由
    const {
      selectedKeys,
      openKeys,
    } = this.getMenuStat(this.props.location.pathname);
    this.setState({
      selectedKeys,
      openKeys
    });
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
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
    if (this.props.pages !== nextProps.pages || this.props.config !== nextProps.config) {
      this.getMenu(nextProps);
    }
  }
  onTitleClick = ({ key }) => {
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
  generatorMenu(menuNode, key, parentPath = '') {
    const childPath = menuNode.path || key;
    const renderPath = parentPath.replace(/\/$/g, '') + '/' + childPath.replace(/^\//g, '');
    const children = menuNode.children || {};
    const subMenu = [];
    Object.keys(children).forEach(ckey => {
      const item = this.generatorMenu(children[ckey], ckey, renderPath);
      if (!children[ckey].menuIgnore) subMenu.push(item);
    });
    if (subMenu && subMenu.length > 0) {
      this.subMenuKeys[renderPath] = menuNode;
      if (menuNode.renderSubMenu && typeof menuNode.renderSubMenu === 'function') return menuNode.renderSubMenu(menuNode, renderPath, subMenu, this.onTitleClick);
      return this.props.renderSubMenu(menuNode, renderPath, subMenu, this.onTitleClick);
    }
    if (!menuNode.menuIgnore) {
      this.menuItemKeys[renderPath] = menuNode;
      if (menuNode.renderItem && typeof menuNode.renderItem === 'function') return menuNode.renderItem(menuNode, renderPath);
      return this.props.renderMenuItem(menuNode, renderPath);
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
  getMenu(props = this.props) {
    const {
      pages = {},
      config: projectConfig = {},
      getMenuItemKeys,
    } = props;
    const {
      root: rootPath = '/',
    } = projectConfig;
    const pageKeys = Object.keys(pages);
    const menu = pageKeys.map(key => this.generatorMenu(pages[key], key, rootPath));
    getMenuItemKeys(this.menuItemKeys);
    this.setState({ menu });
  }
  render() {
    const {
      selectedKeys,
      openKeys,
      menu = [],
    } = this.state;
    const menuProps = {
      mode: 'inline',
      openKeys,
      selectedKeys,
      ...this.props.menuProps,
    };
    if (menuProps.mode !== 'inline' || this.props.collapsed) {
      delete menuProps.openKeys;
    }
    return (
      <AntdMenu
        {
        ...menuProps
        }
      >
        {
          menu
        }
      </AntdMenu>
    );
  }
}
Menu.defaultProps = {
  pages: {},
  location: {},
  config: {
    root: '/',
  },
  getMenuItemKeys: NOOP,
  menuProps: {},
  renderSubMenu,
  renderMenuItem,
  collapsed: false
};
Menu.propTypes = {
  pages: PropTypes.object,
  location: PropTypes.object,
  config: PropTypes.shape({
    root: PropTypes.string,
  }),
  collapsed: PropTypes.bool,
  // antd Menu Props
  menuProps: PropTypes.object,
  // 渲染SubMenu的函数 参数分别为 菜单节点menuNode 路由路径renderPath 递归的子菜单subMenu 展开菜单的函数manageOpenFunc
  renderSubMenu: PropTypes.func,
  // 渲染Menu.Item的函数 参数分别为 菜单节点menuNode 路由路径renderPath
  renderMenuItem: PropTypes.func,
  getMenuItemKeys: PropTypes.func,
};

export default Menu;
