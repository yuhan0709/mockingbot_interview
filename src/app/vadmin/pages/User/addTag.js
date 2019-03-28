import React, { Component } from 'react';
import style from './index.less';
import {
  Form, Input, Button
} from 'antd';

const FormItem = Form.Item;

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className={style.antFormItem}>
        <Form>
          <span style={{ lineHeight: '40px',display: 'inline-block' }}>
                标签键：
            <FormItem style={{ display: 'inline-block', marginRight: '20px' }}>
              {getFieldDecorator('TagKey', {
                rules: [{
                  required: true, message: '请输入标签键',
                }],
              })(
                <Input />
              )}
            </FormItem>
          </span>
          <span style={{ lineHeight: '40px',display: 'inline-block' }}>
                标签值：
            <FormItem style={{ display: 'inline-block',marginRight: '20px' }}>
              {getFieldDecorator('TagValue', {
                rules: [{
                  required: true, message: '请输入标签值',
                }],
              })(
                <Input />
              )}
            </FormItem>
          </span>
          <span style={{ display: 'inline-block' }}>
            <Button type="primary" size="small" style={{ marginRight: '20px' }} onClick={() =>{
              this.props.form.validateFields( async (err, values) => {
                if (!err) {
                  this.props.onOk(values);
                }
              });
            }}>添加</Button>
            <Button type="primary" size="small" onClick={this.props.onCancel}>取消</Button>
          </span>
        </Form>
      </div>
    );
  }
}

export default Form.create()(App);