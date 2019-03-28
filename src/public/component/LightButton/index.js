/**
 * LightButton组件
 * 因为不满意antdButton组件所以自己造
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class LightButton extends PureComponent {
  handleClick = (event) => {
    event.preventDefault();
    this.props.onClick(event);
  }
  render() {
    let className = this.props.className || '';
    if (this.props.buttonType) {
      className = [].concat(className, `word-${this.props.buttonType}`).join(' ');
    }
    return (
      <a
        disabled={this.props.disabled}
        className={className}
        onClick={this.handleClick}
      >{this.props.children}</a>
    );
  }
}
LightButton.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  buttonType: PropTypes.string,
};
LightButton.defaultProps = {
  onClick: () => {},
};
export default LightButton;
