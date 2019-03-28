/**
 * SearchForm组件
 * 使用一个JSON快速拼接出一个search表单
 * TODO: reset方法
 */
import React, { Component } from 'react';
import {
  Form, Button
} from 'antd';
import PropTypes from 'prop-types';
import EasyForm from '../EasyForm';

const EasyFormItem = EasyForm.Item;

@EasyForm.create()
class SearchForm extends Component {
  formatData() {
    const {
      formConfig,
    } = this.props;
    const values = this.props.form.getFieldsValue();
    const format = {};
    Object.keys(values).forEach(key => {
      if (formConfig[key] && formConfig[key].formatValue) {
        format[key] = formConfig[key].formatValue(values[key]);
      } else format[key] = values[key];
    });
    return format;
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.formatData());
  }
  componentDidMount() {
    this.props.onInit(this.formatData());
  }
  render() {
    const {
      formConfig,
    } = this.props;
    return (
      <Form layout="inline" onSubmit={this.handleSubmit}>
        {
          Object.keys(formConfig).map(itemKey => {
            return (
              <EasyFormItem key={itemKey} {...formConfig[itemKey].itemProps}>
                {formConfig[itemKey].children}
              </EasyFormItem>);
          })
        }
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
          >
            查询
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
SearchForm.propTypes = {
  form: PropTypes.object,
  onSubmit: PropTypes.func,
  onInit: PropTypes.func,
  formConfig: PropTypes.object,
};
SearchForm.defaultProps = {
  onSubmit: () => {},
  onInit: () => {},
  formConfig: {}
};
export default SearchForm;