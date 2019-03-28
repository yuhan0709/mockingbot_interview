import React, { Component } from 'react';
import style from './index.less';
//import Api from '../../util/request';
import {
  Form, Input, Select, Button
} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

class Basics extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 4 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 20 },
        sm: { span: 20 },
      },
    };


    return (
      <div style={{ minWidth: '850px', marginBottom: 50 }}>
        <div className={style.photo}>
          张三
        </div>
        <Form className={style.content}>
          <FormItem>
            <h3>基本信息</h3>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="用户ID"
          >
            <span>123455</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="用户名"
          >
            <span>yanningning</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="手机号"
          >
            <span>18399021345</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="邮箱"
          >
            <span>abc@bytedance.com</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="认证信息"
          >
            <span>尚未实名认证   </span>
            <a>   马上认证</a>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="注册时间"
          >
            <span>2018-12-12 12:12:12</span>
          </FormItem>
          <FormItem>
            <h3>业务信息</h3>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="所属行业"
          >
            {getFieldDecorator('a', {
              rules: [{
                required: true, message: '请选择行业',
              }],
            })(
              <Select style={{ width: '100%' }}>
                <Option value="86">+86</Option>
                <Option value="87">+87</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="主营业务"
          >
            {getFieldDecorator('b')(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="网址"
          >
            {getFieldDecorator('c')(
              <Input />
            )}
          </FormItem>
          <FormItem>
            <h3>联系信息</h3>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="国家/地区"
          >
            {getFieldDecorator('d',{
              rules: [{
                required: true,
              }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="所在区域"
          >
            {getFieldDecorator('e',{
              rules: [{
                required: true,
              }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="具体地址"
          >
            {getFieldDecorator('f')(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="联系电话"
          >
            {getFieldDecorator('g')(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="传真"
          >
            {getFieldDecorator('f')(
              <Input />
            )}
          </FormItem>
          <FormItem
            wrapperCol={{
              xs: { span: 20, offset: 4 },
              sm: { span: 20, offset: 4 },
            }}
          >
            <Button type="primary">
              保存
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(Basics);