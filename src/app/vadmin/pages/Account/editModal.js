import React, { Component } from 'react';
import { Modal, Input, Form } from 'antd';
import Apis from '../../util/request';

const FormItem = Form.Item;

class EditModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      confirmLoading: false,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible){
      this.props.form.resetFields();
      this.setState({
        value: ''
      });
    }
  }

  confirm = () => {
    if (!this.state.value || this.state.value === this.props.target.Email) {
      this.props.hideModal();
      return;
    }
    if (/^[a-z.A-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(this.state.value)) {
      this.setState({ confirmLoading: true },async () => {
        await Apis.UpdateAccount({ AccountID: this.props.target.Id, Email: this.state.value }).finally(() => {
          this.setState({ confirmLoading: false });
        });
        this.props.hideModal();
        this.props.refresh();
      });
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title="编辑"
        visible={this.props.visible}
        onOk={this.confirm}
        onCancel={this.props.hideModal}
        confirmLoading={this.state.confirmLoading}
      >
        <table>
          <tbody>
            <tr>
              <td>用户ID：</td>
              <td style={{ height: 34 }}>
                {this.props.target.Id}
              </td>
            </tr>
            <tr>
              <td>用户名：</td>
              <td style={{ height: 34 }}>
                {this.props.target.Identity}
              </td>
            </tr>
            <tr>
              <td style={{ position: 'relative',bottom: 10 }}>邮箱：</td>
              <td>
                <Form>
                  <FormItem>
                    {getFieldDecorator('nickname', {
                      initialValue: this.props.target.Email,
                      rules: [{
                        pattern: /^[a-z.A-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                        message: '邮箱格式错误'
                      }],
                    })(
                      <Input
                        placeholder="请输入邮箱"
                        onChange={e=>{ this.setState({ value: e.target.value }); }}
                        style={{ width: 300 }}
                      />
                    )}
                  </FormItem>
                </Form>
              </td>
            </tr>
          </tbody>
        </table>
      </Modal>
    );
  }
}

const fcEditModal = Form.create()(EditModal);

export default fcEditModal;