/**
 * InjectData高阶组件
 * 会将该组件的指定函数属性中加入指定属性
 * 常用于组件自动绑定数据
 */
import React from 'react';

export default (functionName = 'onClick', propName = 'data') => (WarppedComponent) =>
  function InjectDataHOC(props) {
    const newProps = { ...props };
    const bindFunction = props[functionName];
    if (bindFunction && typeof bindFunction === 'function') {
      newProps[functionName] = function() {
        bindFunction.call(this, arguments, props[propName]);
      };
    }
    return <WarppedComponent {...newProps } />;
  };