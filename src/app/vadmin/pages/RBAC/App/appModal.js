import React, { Component } from 'react';
import { Modal, Form, Input, message } from 'antd';
import Apis from '../../../util/request';
import { connect } from 'react-redux';

const title = {
  add: '添加应用',
  read: '查看应用',
  update: '编辑应用'
};
const FormItem = Form.Item;
const { TextArea } = Input;

@connect(state => {
  return {
    user: state.User.Info,
  };
})
class AppModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      columns: [],
      query: {},
      data: {}
    };
  }

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    if (this.props.visible !== nextProps.visible) {
      this.setState({
        visible: true
      });
    }
  }

  confirm = async () => {
    this.props.form.validateFields( async (err, values) => {
      if (!err) {
        values = {
          ...values,
          Email: this.props.user.email,
          EmployeeName: this.props.user.nickname,
        };
        if (this.props.status === 'add') {
          await Apis.CreateApp(values);
          message.success('创建成功');
        } else {
          values = {
            ...values,
            AppId: this.props.initialValue.Id,
          };
          await Apis.UpdateApp(values);
          message.success('修改成功');
        }
        this.props.change();
        this.cancel();
      }
    });
  }

  cancel = () => {
    this.props.form.resetFields();
    this.setState({
      visible: false
    });
  }

  render() {
    const { status, initialValue } = this.props;
    if (!status) {
      return <div></div>;
    }

    const formItemLayout = {
      labelCol: {
        sm: { span: 5 },
      },
      wrapperCol: {
        sm: { span: 19 },
      },
    };
    const { getFieldDecorator } = this.props.form;
    const read = status === 'read';
    const add = status === 'add';

    let footer = {};
    if (read) {
      footer = {
        footer: null
      };
    }
    return (
      <div>
        <Modal
          title={title[this.props.status]}
          visible={this.state.visible}
          onOk={this.confirm}
          onCancel={this.cancel}
          {...footer}
        >
          <Form className="login-form">
            <FormItem
              {...formItemLayout}
              label="应用名称"
            >
              {getFieldDecorator('Name', {
                rules: [{
                  required: true,
                  message: '请输入应用名称',
                }],
                getValueFromEvent: val => {
                  val = val.target.value.slice(0,32);
                  return val;
                },
                initialValue: add ? '' : initialValue.Name,
              })(
                <Input placeholder="请输入应用名称"  disabled={read}/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="应用描述"
            >
              {getFieldDecorator('Description', {
                getValueFromEvent: val => {
                  val = val.target.value.slice(0,128);
                  return val;
                },
                initialValue: add ? '' : initialValue.Description,
              })(
                <TextArea  disabled={read}/>
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

const AppModalForm = Form.create()(AppModal);
export default AppModalForm;