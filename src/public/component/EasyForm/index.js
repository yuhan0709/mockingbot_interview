import React, { Component } from 'react';
import { Form } from 'antd';
import PropTypes from 'prop-types';
import create from '../../hoc/EasyForm';

class Item extends Component {
  constructor(props, context) {
    super(props, context);
    if (!context.form) throw new Error('EasyForm.Item父级未被EasyForm.create修饰');
  }
  render() {
    const { getFieldDecorator } = this.context.form;
    const { getFieldFParam } = this.props;
    return (
      <Form.Item {...this.props}>
        {this.props.childrenBefore}
        {getFieldDecorator(getFieldFParam.name, getFieldFParam.config)(this.props.children)}
        {this.props.childrenAfter}
      </Form.Item>
    );
  }
}
Item.contextTypes = {
  form: PropTypes.object,
};
Item.propTypes = {
  // getFieldDecorator函数的形参map
  getFieldFParam: PropTypes.shape({
    name: PropTypes.string,
    config: PropTypes.object
  }),
  children: PropTypes.element,
  childrenBefore: PropTypes.element,
  childrenAfter: PropTypes.element
};
Item.defaultProps = {
  getFieldFParam: {},
};
export default {
  create,
  Item,
};