import React, { Component } from 'react';
import { Switch, Route, Redirect, matchPath } from 'react-router';
import PropTypes from 'prop-types';

const NOOP = () => {};
export const routeMatchFuncs = new Proxy({}, {
  get(target, key) {
    if (target[key]) return target[key];
    return NOOP;
  }
});
export class NewSwitch extends Switch {
  static routeMatchFuncs = {};
  static propTypes = {
    routeKey: PropTypes.string,
  }
  static defaultProps = {
    routeKey: 'global'
  }
  constructor(props) {
    super(props);
    if (routeMatchFuncs[this.props.routeKey] && (routeMatchFuncs[this.props.routeKey] !== NOOP)) {
      console.error('路由routeKey冲突');
    }
    routeMatchFuncs[this.props.routeKey] = this.match;
  }
  match = (pathname) => {
    var route = this.context.router.route;
    var children = this.props.children;
    var match = void 0;
    React.Children.forEach(children, function (element) {
      if (!React.isValidElement(element)) return;

      var _element$props = element.props,
        pathProp = _element$props.path,
        exact = _element$props.exact,
        strict = _element$props.strict,
        sensitive = _element$props.sensitive,
        from = _element$props.from,
        node = _element$props.node;
      var path = pathProp || from;

      if (match == null) {
        match = path ? matchPath(pathname, { path: path, exact: exact, strict: strict, sensitive: sensitive }) : route.match;
        if (match) match.node = node;
      }
    });

    return match;
  }
  render() {
    return super.render();
  }
}

class Router extends Component {
  static defaultProps = {
    pages: {},
    config: {
      initPath: '/',
      root: '/',
      title: 'webgenerator',
      forceTrailingSlash: false,
    },
    routeKey: 'global'
  };
  static propTypes = {
    pages: PropTypes.object,
    config: PropTypes.shape({
      initPath: PropTypes.string,
      root: PropTypes.string,
      title: PropTypes.string.isRequired,
      style: PropTypes.object,
      forceTrailingSlash: PropTypes.bool
    }),
    // 路由key值，用于多路由情况下区分路由匹配函数
    routeKey: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.routeList = [];
    this.state = {
      routeList: []
    };
    this.noMatchRoute = <Route key="404" component={null} />;
    this.makeRouteList();
  }
  makeRouteList(props = this.props) {
    const {
      pages = {},
      config: projectConfig = {}
    } = props;
    const {
      root: rootPath = '/',
    } = projectConfig;
    const pageKeys = Object.keys(pages);
    this.routeList = [];
    pageKeys.forEach(key => this.routeList.push(this.generatorRouteAndMenu(pages[key], key, rootPath, this.routeList)));
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.pages !== nextProps.pages || this.props.config !== nextProps.config) {
      this.makeRouteList(nextProps);
    }
  }
  generatorRouteAndMenu(menuNode, key, parentPath = '', routeList, parentNode) {
    const childPath = menuNode.path || key;
    menuNode.parentNode = parentNode;
    const renderPath = `${parentPath.replace(/\/$/g, '')}/${childPath.replace(/(^\/|\/$)/g, '')}${this.props.config.forceTrailingSlash ? '/' : ''}`.replace('//', '/');
    if (menuNode.pathIgnore) {
      //处理noMatch的组件（404）
      this.noMatchRoute = <Route node={menuNode} key={renderPath} component={menuNode.component} />;
      return true;
    }

    const children = menuNode.children || {};
    routeList.push(...Object.keys(children).map(ckey =>
      // 为了生成route 递归调用一下
      this.generatorRouteAndMenu(
        children[ckey],
        ckey,
        renderPath,
        routeList,
        menuNode)
    ));
    //生成路由
    if (menuNode.component) {
      if (this.props.config.forceTrailingSlash && renderPath !== '/') {
        const noDevPath = renderPath.replace(/\/$/, '');
        routeList.push(<Redirect node={menuNode} strict={this.props.config.forceTrailingSlash} exact key={noDevPath} from={noDevPath} to={renderPath} />);
      }
      return <Route node={menuNode} strict={this.props.config.forceTrailingSlash} exact key={renderPath} path={renderPath} component={menuNode.component} />;
    }
    return null;
  }
  render() {
    const {
      config: projectConfig = {},
      routeKey,
    } = this.props;
    const {
      root: rootPath = '/',
      initPath,
    } = projectConfig;
    return (
      <NewSwitch routeKey={routeKey}>
        {
          this.routeList
        }
        { initPath && initPath !== rootPath && <Redirect exact from={rootPath} to={initPath} />}
        { this.noMatchRoute }
      </NewSwitch>
    );
  }
}

export default Router;
