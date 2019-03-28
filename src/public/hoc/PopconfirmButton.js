/**
 * PopconfirmButton高阶组件
 * 为组件添加popconfirm功能
 */
import React from 'react';
import { Popconfirm } from 'antd';
import PropTypes from 'prop-types';

const NOOP = () => {};
export default (functionName = 'onClick') => (WarppedComponent) => {
  class PopconfirmButtonHOC extends WarppedComponent {
    constructor(props, context) {
      super(props, context);
      this.onConfirm = this[functionName];
      this[functionName] = NOOP;
    }
    render() {
      if (!this.props.needConfirm){
        if (this[functionName] === NOOP) this[functionName] = this.onConfirm;
        return super.render();
      }
      if (this[functionName]) this[functionName] = NOOP;
      return <Popconfirm onConfirm={this.onConfirm} title={this.props.confirmText}>
        {super.render()}</Popconfirm>;
    }
  }
  PopconfirmButtonHOC.propTypes = {
    confirmText: PropTypes.string,
    needConfirm: PropTypes.bool,
  };
  PopconfirmButtonHOC.defaultProps = {
    confirmText: '确定要这么做吗？',
    needConfirm: false
  };
  return PopconfirmButtonHOC;
};
