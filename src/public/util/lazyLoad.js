import Loadable from 'react-loadable';
import React, { Component } from 'react';
import { Spin as AntdSpin } from 'antd';

let showSpin = true;
class Spin extends Component {
  render() {
    if (this.props.error) {
      console.error('lazyLoad error:', this.props.error);
    }
    if (this.props.timedOut) {
      console.error('lazyLoad timedout');
    }
    return showSpin ? <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AntdSpin /></div> : null;
  }
}
let Loading = Spin;

export default function lazyLoad(loader) {
  return Loadable({
    loader,
    loading: Loading,
  });
}

export function LazyLoadComponent(importFunction) {
  let LazyComponent = 'div';
  return class LazyContainer extends Component {
    constructor(props) {
      super(props);
      // importFunction: () => import(path)
      // 此处import不能使用完全动态引用【path不能是一个变量 但是可以是拼接字符串】 参考https://www.webpackjs.com/api/module-methods/#import-
      LazyComponent = lazyLoad(importFunction);
    }
    render() {
      return <LazyComponent {...this.props}/>;
    }
  };
}

export function setLoadConfig(config) {
  if (config.showSpin !== undefined) showSpin = config.showSpin;
  if (config.Loading !== undefined) Loading = config.Loading;
}