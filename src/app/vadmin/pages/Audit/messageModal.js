import React, { Component } from 'react';
import { Form, Modal } from 'antd';
import style from './style.less';

const FormItem = Form.Item;
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      refuse_reason: 0,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible){
      this.props.form.resetFields();
    }
  }

  handleCancel = () => {
    this.props.onCancel();
  }

  render() {
    const { details = {} } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 5 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 19 },
        sm: { span: 19 },
      },
    };
    return (
      <Modal
        title="查看详情"
        visible={this.props.visible}
        onCancel={this.handleCancel}
        footer={null}
      >
        <Form className={style.form} style={{ marginBottom: 30 }}>
          <FormItem>
            <h3>详情</h3>
          </FormItem>
          {
            Object.keys(details).map(key => (<FormItem
              key={key}
              {...formItemLayout}
              label={key}
            >
              <span>{details[key]}</span>
            </FormItem>))
          }
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(Product);