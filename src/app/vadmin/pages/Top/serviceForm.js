import React, { Component } from 'react';
import EasyForm from '@component/EasyForm';
import { Form, Input, Modal, Radio } from 'antd';
import PropTypes from 'prop-types';

const RadioGroup = Radio.Group;
const EasyFormItem = EasyForm.Item;
const initialValueMap = {
  ServiceName: '',
  ServiceShortName: '',
  Psm: '',
  Owner: ''
};
const itemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15, offset: 1 },
};
@EasyForm.create()
class ServiceForm extends Component {
  static propTypes = {
    isEdit: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    visible: PropTypes.bool,
    service: PropTypes.object,
    initialValueMap: PropTypes.object,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  }
  static defaultProps = {
    isEdit: true,
    confirmLoading: false,
    visible: false,
    service: {},
    initialValueMap,
    onOk: () => {
    },
    onCancel: () => {
    }
  }
  formConfig = {
    ServiceName: {
      itemProps: {
        ...itemLayout,
        label: '服务名',
        getFieldFParam: {
          name: 'ServiceName',
          config: {
            initialValue: this.props.initialValueMap.ServiceName,
            rules: [{
              required: true,
              message: '服务名必填',
            }, {
              pattern: /^\w+$/g,
              message: '只允许使用英文、数字、下划线'
            }]
          }
        }
      },
      children: (<Input maxLength={20} placeholder="请输入服务名" disabled={this.props.isEdit}/>)
    },
    Owner: {
      itemProps: {
        ...itemLayout,
        label: '服务所有者',
        getFieldFParam: {
          name: 'Owner',
          config: {
            rules: [{
              pattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@bytedance.com$/g,
              message: '只允许使用公司邮箱'
            }],
            initialValue: this.props.initialValueMap.Owner
          }
        }
      },
      children: (<Input placeholder="请输入服务所有者邮箱" />)
    },
    PSM: {
      itemProps: {
        ...itemLayout,
        label: 'PSM',
        getFieldFParam: {
          name: 'Psm',
          config: {
            rules: [{
              required: true,
              message: 'PSM 必填',
            }, {
              pattern: /^(.*)\.(.*)\.(.*)$/g,
              message: '只允许三段式的PSM'
            }],
            initialValue: this.props.initialValueMap.Psm
          }
        }
      },
      children: (<Input maxLength={1024} placeholder="请输入产品PSM" />)
    },
    Status: {
      itemProps: {
        ...itemLayout,
        label: '服务状态',
        getFieldFParam: {
          name: 'Status',
          config: {
            rules: [{
              required: true,
              message: '状态必选',
            }],
            initialValue: this.props.initialValueMap.Status || 'offline'
          }
        }
      },
      children: (<RadioGroup><Radio value="online" disabled={!this.props.isEdit}>上线</Radio>
        <Radio disabled={this.props.isEdit} value="offline">下线</Radio></RadioGroup>)
    }
  }
  formatData() {
    const values = this.props.form.getFieldsValue();
    const format = {};
    Object.keys(values).forEach(key => {
      let value = values[key];
      if (typeof value === 'string') value = value.trim();
      if (this.formConfig[key] && this.formConfig[key].formatValue) {
        format[key] = this.formConfig[key].formatValue(value);
      } else format[key] = value;
    });
    return format;
  }
  onOk = () => {
    this.props.form.validateFields((err) => {
      if (!err) this.props.onOk({ ServiceId: this.props.service.ServiceId, BusinessID: this.props.service.BusinessID,...this.formatData() });
    });
  }
  render() {
    return (
      <Modal
        title={this.props.isEdit ? '编辑' : '新建'}
        visible={this.props.visible}
        onOk={this.onOk}
        onCancel={this.props.onCancel}
        confirmLoading={this.props.confirmLoading}
        destroyOnClose
      >
        <Form layout="horizontal">
          {
            Object.keys(this.formConfig).map(itemKey => {
              return (
                <EasyFormItem key={itemKey} {...this.formConfig[itemKey].itemProps}>
                  {this.formConfig[itemKey].children}
                </EasyFormItem>);
            })
          }
        </Form>
      </Modal>
    );
  }
}
export default ServiceForm;