import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb as AntdBreadcrumb } from 'antd';
import { withRouter } from 'react-router';
import Link from '../Link';
import { routeMatchFuncs } from '@component/Route';
import style from './style.less';
@withRouter
class Breadcrumbs extends React.Component {
  static propTypes = {
    config: PropTypes.shape({
      initPath: PropTypes.string,
      root: PropTypes.string,
      title: PropTypes.string.isRequired,
      style: PropTypes.object,
    }),
    // 路由key值，用于多路由情况下区分路由匹配函数
    routeKey: PropTypes.string,
    className: PropTypes.string,
    location: PropTypes.object,
  };
  static defaultProps = {
    config: {
      initPath: '/',
      root: '/',
      title: 'webgenerator'
    },
    routeKey: 'global',
    className: ''
  };
  state = {
    crumbList: []
  }
  // 获取当前节点的路径
  getNodeList = () => {
    const {
      routeKey = 'global',
      location = {}
    } = this.props;
    const nodeList = [];
    const curMatch = routeMatchFuncs[routeKey](location.pathname);
    if (curMatch && curMatch.node) {
      let pNode = curMatch.node;
      while (pNode) {
        nodeList.unshift(pNode);
        pNode = pNode.parentNode;
      }
    }
    return nodeList;
  }
  // 获取存在路由的url
  getLinkMap = () => {
    const {
      config,
      routeKey = 'global',
      location = {}
    } = this.props;
    const paths = location.pathname.replace(new RegExp(`(^${config.root}|\\/$)`, 'g'), '').split('/');
    const linkMap = new Map();
    let nodePath = config.root;
    for (let i = 0, l = paths.length; i < l; i++ ) {
      nodePath = (nodePath + '/' + paths[i]).replace(/\/\//g, '/');
      const newNodePath = nodePath + (config.forceTrailingSlash ? '/' : '');
      const match = routeMatchFuncs[routeKey](newNodePath);
      if (match && match.path !== config.root && match.node) {
        linkMap.set(match.node, newNodePath);
      }
    }
    return linkMap;
  }
  getCrumbList = async () => {
    const nodeList = this.getNodeList();
    const linkMap = this.getLinkMap();
    // fix match bug
    const curMatch = routeMatchFuncs[this.props.routeKey](this.props.location.pathname);
    const crumbList = await Promise.all(nodeList.map(async(node, index) => {
      const link = linkMap.get(node);
      const nameType = typeof node.name;
      let name = '';
      switch (nameType) {
      case 'string':
      case 'number':
        name = node.name;
        break;
      case 'function':
        name = await node.name({ ...this.props, match: curMatch });
        break;
      default:
        throw new Error('node name error ' + node.name);
      }
      if (link && index < nodeList.length - 1 && !node.disableLink) {
        return (<AntdBreadcrumb.Item key={index}><Link to={link}>{name}</Link></AntdBreadcrumb.Item>);
      }
      return (<AntdBreadcrumb.Item key={index}>{name}</AntdBreadcrumb.Item>);
    }));
    this.setState({
      crumbList
    });
    return crumbList;
  }
  componentDidMount() {
    this.getCrumbList();
  }
  oldLocation = this.props.location;
  oldMatch = this.props.match;
  render () {
    return (
      <AntdBreadcrumb className={`${style.breadcrumb} ${this.props.className}`}>
        {this.state.crumbList.length > 0 ? this.state.crumbList : <span></span>}
      </AntdBreadcrumb>
    );
  }
  componentDidUpdate() {
    if (this.oldLocation !== this.props.location) {
      console.log('change');
      this.oldLocation = this.props.location;
      this.getCrumbList();
    }
  }
}
export default Breadcrumbs;
