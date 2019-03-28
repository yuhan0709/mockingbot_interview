import React, { Component } from 'react';
import { Modal, Form, Input, message } from 'antd';
import Apis from '../../../util/request';
import { connect } from 'react-redux';

const title = {
  add: '添加资源',
  update: '编辑资源'
};
const FormItem = Form.Item;

@connect(state => {
  return {
    user: state.User.Info,
  };
})
class ResourceModal extends Component {
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
            AppName: this.props.appName,
          };
          if (this.props.status === 'add') {
            await Apis.CreateResource(values);
            message.success('创建成功');
          } else {
            values = {
              ...values,
              ResourceId: this.props.initialValue.Id,
            };
            await Apis.UpdateResource(values);
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
      const update = status === 'update';

      let footer = {};
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
                label="Resource ID"
              >
                {getFieldDecorator('Resource', {
                  rules: [{
                    required: true,
                    message: '请输入Resource ID',
                  }],
                  getValueFromEvent: val => {
                    val = val.target.value.slice(0,32);
                    return val;
                  },
                  initialValue: update ? initialValue.Resource : '',
                })(
                  <Input disabled={update}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="资源名称"
              >
                {getFieldDecorator('Name', {
                  rules: [{
                    required: true,
                    message: '请输入资源名称',
                  }],
                  getValueFromEvent: val => {
                    val = val.target.value.slice(0,32);
                    return val;
                  },
                  initialValue: update ? initialValue.Name : '',
                })(
                  <Input />
                )}
              </FormItem>
            </Form>
          </Modal>
        </div>
      );
    }
}

const ResourceModalForm = Form.create()(ResourceModal);
export default ResourceModalForm;