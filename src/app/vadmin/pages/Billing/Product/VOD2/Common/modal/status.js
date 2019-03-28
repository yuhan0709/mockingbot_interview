import React, { Component } from 'react';
import { Modal, Form, Select, message } from 'antd';
import Apis from '../../../../../../util/request';

const FormItem = Form.Item;
const Option = Select.Option;

class QueryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  UNSAFE_componentWillReceiveProps = async (nextProps) => {
    if (this.props.visible !== nextProps.visible) {
      this.props.form.resetFields();
      this.setState({
        visible: true
      });
    }
  }

  confirm = () => {
    this.props.form.validateFields( async (err, values) => {
      if (!err) {
        await Apis.UpdateProducts({
          ProductGroupId: this.props.target.ProductGroupId,
          Info: [
            {
              Status: values.Status,
              ProductId: this.props.target.Id,
              BillingMethodSet: this.props.target.BillingMethodCombination,
            }
          ]
        });
        message.success('修改成功');
        this.props.update();
        this.cancel();
      }
    });
  }

  cancel = () => {
    this.setState({
      visible: false
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 18 },
        sm: { span: 18 },
      },
    };
    return (
      <div>
        <Modal
          title="上线状态更改"
          visible={this.state.visible}
          onOk={this.confirm}
          onCancel={this.cancel}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label="商品ID"
            >
              {this.props.target.Id}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="上线状态"
            >
              {getFieldDecorator('Status', {
                initialValue: this.props.target.Status ? 1 : 0,
              })(
                <Select style={{ width: 220 }} >
                  <Option value={1}>上线</Option>
                  <Option value={0}>下线</Option>
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
const fcQueryModal = Form.create()(QueryModal);
export default fcQueryModal;