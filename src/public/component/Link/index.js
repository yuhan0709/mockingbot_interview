/**
 * Link组件
 * 低仿 react-router-dom的Link组件
 * 添加了自动添加ROOT_PATH的功能
 * 当to属性以 ~ 开头时，~ 将被替换为 ROOT_PATH
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LightButton from '../LightButton';
import Navigate from '../../util/navigate';

class Link extends Component {
  handleClick = (event) => {
    event.preventDefault();
    const {
      to,
      replace,
      appRouter,
    } = this.props;
    Navigate.go(to, replace, appRouter);
  }
  render() {
    return (
      <LightButton {...this.props} onClick={this.handleClick}>{this.props.children}</LightButton>
    );
  }
}
Link.propTypes = {
  to: PropTypes.string.isRequired,
  replace: PropTypes.bool,
  children: PropTypes.any,
  appRouter: PropTypes.bool,
};
Link.defaultProps = {
  appRouter: true,
  replace: false,
};
export default Link;
