import React, { Component } from 'react';
import EasyForm from '@component/EasyForm';
import { Form, Input, Modal, Select, Radio } from 'antd';
import PropTypes from 'prop-types';
// import style from './index.less';
import { connect } from 'react-redux';
import TopActions from '../../../../redux/actions/Top';
import { bindActionCreators } from 'redux';
import UserActions from '../../../../redux/actions/User';
import { withRouter } from 'react-router';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const EasyFormItem = EasyForm.Item;
const initialValueMap = {
  Key: '',
  Type: 'string',
  IsArray: '0',
  IsResource: '0',
  ResourceTypeId: '',
  Description: ''
};
const itemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15, offset: 1 },
};

@withRouter
@connect((state) => ({
  resourceTypes: state.Top.ResouceTypes
}), (dispatch) => ({
  actions: bindActionCreators({ ...UserActions, ...TopActions }, dispatch)
}))
@EasyForm.create()
class ApiParamForm extends Component {
  static propTypes = {
    isEdit: PropTypes.bool,
    isView: PropTypes.bool,
    disabledOnline: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    visible: PropTypes.bool,
    dataSource: PropTypes.object,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    initialValueMap: PropTypes.object,
  }
  static defaultProps = {
    isEdit: false,
    isView: false,
    disabledOnline: true,
    visible: false,
    confirmLoading: false,
    initialValueMap,
    dataSource: {},
    onOk: () => {
    },
    onCancel: () => {
    }
  }

  async componentDidMount() {
    await this.props.actions.getResourceTypes({ BusinessID: this.props.match.params.ServiceId, Limit: 10000, Offset: 0 });
  }

  formConfig = {
    Key: {
      itemProps: {
        ...itemLayout,
        label: '参数名',
        getFieldFParam: {
          name: 'Key',
          config: {
            rules: [{
              required: true,
              message: '名称必填',
            }, {
              pattern: /^[a-zA-Z]+$/g,
              message: '只允许英文大小写'
            }],
            initialValue: this.props.initialValueMap.Key,
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.Key}</p> :
        <Input maxLength={50} placeholder="请输入参数名"/>)
    },
    Type: {
      itemProps: {
        ...itemLayout,
        label: '类型',
        getFieldFParam: {
          name: 'Type',
          config: {
            rules: [{
              required: true,
              message: '类型必填',
            }],
            initialValue: this.props.initialValueMap.Type,
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.Type}</p> :
        <Select>
          <Option value="string">string</Option>
          <Option value="int">int</Option>
          <Option value="float">float</Option>
          <Option value="long">long</Option>
          <Option value="double">double</Option>
        </Select>
      )
    },
    IsArray: {
      itemProps: {
        ...itemLayout,
        label: '是否数组',
        getFieldFParam: {
          name: 'IsArray',
          config: {
            rules: [{
              required: true,
              message: '是否数组必填',
            }],
            initialValue: this.props.initialValueMap.IsArray + '',
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.IsArray ? '是' : '否'}</p> :
        <RadioGroup><Radio value="1">是</Radio><Radio value="0">否</Radio></RadioGroup>)
    },
    IsResource: {
      itemProps: {
        ...itemLayout,
        label: '是否代表ResourceID',
        getFieldFParam: {
          name: 'IsResource',
          config: {
            rules: [{
              required: true,
              message: '此项必填',
            }],
            initialValue: this.props.initialValueMap.IsResource + '',
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.IsResource ? '是' : '否'}</p> :
        <RadioGroup><Radio value="1">是</Radio><Radio value="0">否</Radio></RadioGroup>)
    },
    ResourceTypeId: {
      itemProps: {
        ...itemLayout,
        label: '关联Resource Type',
        getFieldFParam: {
          name: 'ResourceTypeId',
          config: {
            rules: [{
              required: true,
              message: '此项必填',
            }],
            initialValue: this.props.initialValueMap.ResourceTypeId,
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.ResourceTypeId}</p> :
        <Select>
          {this.props.resourceTypes.map(e => <Option key={e.ResourceTypeId} value={e.ResourceTypeId}>{e.ResourceNameCn}</Option>)}
        </Select>
      )
    },
    Description: {
      itemProps: {
        ...itemLayout,
        label: '参数描述',
        getFieldFParam: {
          name: 'Description',
          config: {
            initialValue: this.props.initialValueMap.Description,
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.Description}</p> :
        <Input.TextArea row={5} maxLength={140} placeholder="请输入参数描述"/>)
    },
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
      if (!err) this.props.onOk({ ...this.formatData(),ApiParamId: this.props.dataSource.ApiParamId, });
    });
  }

  render() {
    const isResource = this.props.form.getFieldsValue().IsResource === '1';
    return (
      <Modal
        title={this.props.isEdit ? '编辑API参数' : this.props.isView ? '基本信息' : '新建API参数'}
        width={720}
        visible={this.props.visible}
        onOk={this.onOk}
        onCancel={this.props.onCancel}
        confirmLoading={this.props.confirmLoading}
        footer={this.props.isView ? null : undefined}
        destroyOnClose
      >
        <Form layout="horizontal">
          {
            Object.keys(this.formConfig).map(itemKey => {
              if (itemKey === 'ResourceTypeId' && !isResource) {
                return null;
              }
              return (
                <EasyFormItem key={itemKey} {...this.formConfig[itemKey].itemProps}
                  formMap={this.props.form.getFieldsValue()}>
                  {this.formConfig[itemKey].children}
                </EasyFormItem>);
            })
          }
        </Form>
      </Modal>
    );
  }

}

export default ApiParamForm;