import React, { Component } from 'react';
import { Modal, Input, Form, Radio } from 'antd';
import Apis from '../../../util/request';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;

class RsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      confirmLoading: false,
      target: {}
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      let target = { ...nextProps.target };
      if (!nextProps.target || !nextProps.target.ResourceTypeId) {
        target = {
          ResourceNameCn: '',
          ResourceName: '',
          IsProjectResource: 0,
          Description: '',
          IsRegionResource: '',
        };
      }
      this.props.form.resetFields();
      this.setState({
        ServiceId: this.state.ServiceId,
        target,
        ssname: new URLSearchParams(window.location.search).get('ssname')
      });
    }
  }

  confirm = () => {
    this.props.form.validateFields(async (err, values) => {
      if (!err){
        this.setState({
          confirmLoading: true
        });
        const rtId = this.state.target.ResourceTypeId;
        values.IsRegionResource = values.IsRegionResource ? 1 : 0;
        values.IsProjectResource = values.IsProjectResource ? 1 : 0;
        delete values.TRN;
        if (rtId) {
          await Apis.UpdateResourceType({ BusinessID: this.props.ServiceId,...values,ResourceTypeId: rtId }).finally(() => {
            this.setState({
              confirmLoading: false
            });
          });
        } else {
          await Apis.CreateResourceType({ BusinessID: this.props.ServiceId,...values,ServiceId: this.props.ServiceId }).finally(() => {
            this.setState({
              confirmLoading: false
            });
          });
        }
        this.props.hideModal();
        this.props.refresh();
      }
    });
  }

  formItemLayout = {
    labelCol: {
      sm: { span: 6 },
    },
    wrapperCol: {
      sm: { span: 18 },
    },
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title={this.props.title}
        visible={this.props.visible}
        onOk={this.confirm}
        onCancel={this.props.hideModal}
        confirmLoading={this.state.confirmLoading}
      >
        <Form className="login-form">
          <FormItem
            {...this.formItemLayout}
            label='资源中文名称'
          >
            {getFieldDecorator('ResourceNameCn', {
              rules: [{
                required: true, message: '请输入资源中文名称' }
              ],
              initialValue: this.state.target.ResourceNameCn,
              getValueFromEvent: event => {
                const value = event.target.value.slice(0,20);
                this.setState({
                  target: { ...this.state.target,ResourceNameCn: value }
                });
                return value;
              }
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            {...this.formItemLayout}
            label='资源英文名称'
          >
            {getFieldDecorator('ResourceName', {
              rules: [
                { required: true, message: '请输入资源英文名称' },
                { pattern: /^[\w\s]+$/, message: '仅支持英文、数字、下划线、空格' }
              ],
              initialValue: this.state.target.ResourceName,
              getValueFromEvent: event => {
                const value = event.target.value.slice(0,50);
                this.setState({
                  target: { ...this.state.target,ResourceName: value }
                });
                return value;
              }
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            {...this.formItemLayout}
            label='资源描述'
          >
            {getFieldDecorator('Description', {
              initialValue: this.state.target.Description,
              getValueFromEvent: event => {
                const value = event.target.value;
                this.setState({
                  target: { ...this.state.target,Description: value }
                });
                return value;
              }
            })(
              <TextArea/>
            )}
          </FormItem>
          <FormItem
            {...this.formItemLayout}
            label="可归属于项目"
          >
            {getFieldDecorator('IsProjectResource', {
              initialValue: !!this.state.target.IsProjectResource,
              getValueFromEvent: event => {
                const value = event.target.value;
                this.setState({
                  target: { ...this.state.target,IsProjectResource: value }
                });
                return value;
              }
            })(
              <RadioGroup>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem
            {...this.formItemLayout}
            label="与region相关"
          >
            {getFieldDecorator('IsRegionResource', {
              initialValue: !!this.state.target.IsRegionResource,
              getValueFromEvent: event => {
                const value = event.target.value;
                this.setState({
                  target: { ...this.state.target,IsRegionResource: value }
                });
                return value;
              }
            })(
              <RadioGroup>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem
            {...this.formItemLayout}
            label="资源TRN格式"
          >
            {getFieldDecorator('TRN', {
            })(
              <span>
                trn:
                {this.state.ssname}:
                {this.state.target.IsRegionResource ? '{{.region}}' : ''}:
                {'{{.account}}'}:
                {this.state.target.ResourceName}
                {'/{{.id}}'}
              </span>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

const fcModal = Form.create()(RsModal);

export default fcModal;