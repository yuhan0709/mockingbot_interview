import React, { Component } from 'react';
import { Form, Modal, Input, Select, Switch, message } from 'antd';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import { PolicyNameRules } from './policyRules';
import Apis from '../../../../util/request';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};
const Option = Select.Option;
const confirm = Modal.confirm;

const titleMap = {
  read: '查看策略',
  create: '添加策略',
  update: '编辑策略'
};
class QueryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
      statusLock: false,
      statusChecked: false
    };
  }

  UNSAFE_componentWillReceiveProps = async (nextProps) => {
    if (this.props.visible !== nextProps.visible) {
      let statusLock = false, statusChecked = false;
      statusChecked = !!nextProps.initialValue.Status && nextProps.initialValue.Status === 'active';
      if (nextProps.status === 'update') {
        statusLock = nextProps.initialValue.Status === 'active';
      }
      this.setState({
        visible: true,
        statusLock,
        statusChecked
      }, () => {
        this.props.form.resetFields();
      });
      this.editor && this.editor.set(JSON.parse(nextProps.initialValue.PolicyDocument || '{}'));
    }
  }

  handleOk = async () => {
    let self = this;
    this.props.form.validateFields(async (err, val) => {
      if (err) {
        message.error('参数校验失败');
        return;
      }
      let params = {
        ...val,
        Status: this.state.statusChecked ? 'active' : 'inactive',
        PolicyDocument: JSON.stringify(self.editor.get())
      };
      if (this.props.status === 'create') {
        await Apis.CreateSystemPolicy(params);
      } else {
        params = {
          PolicyName: params.PolicyName,
          NewCategory: params.Category,
          NewDescription: params.Description,
          NewPolicyDocument: params.PolicyDocument,
          NewStatus: this.state.statusChecked ? 'active' : 'inactive',
        };
        await Apis.UpdateSystemPolicy(params);
      }
      this.handleCancel();
    });
  };

  handleCancel = () => {
    this.props.form.resetFields();
    this.setState({
      visible: false
    });
    this.props.search();
  }

  onGetRef = (ref) => {
    if (!ref) {
      if (this.editor) {
        this.editor.destroy();
        this.editor = null;
      }
      return;
    }
    this.editor = new JSONEditor(ref, {
      mode: 'code',
      language: 'cn',
      onEditable: () => this.props.status !== 'read'
    });
    document.querySelector('.jsoneditor-format').title = '格式化JSON数据';
    document.querySelector('.jsoneditor-compact').title = '紧凑型JSON数据';
    document.querySelector('.jsoneditor-repair').title = '修复JSON数据';
    this.editor.set(JSON.parse(this.props.initialValue.PolicyDocument || '{}'));
  }

  render() {
    const footer = {}, { status, initialValue, listServices } = this.props;
    if (status === 'read') {
      footer.footer = null;
    }
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Modal
          title={titleMap[this.props.status]}
          visible={this.state.visible}
          width={700}
          onOk={this.handleOk}
          onCancel={() => {
            this.setState({
              visible: false
            });
          }}
          {...footer}
        >
          <FormItem
            {...formItemLayout}
            label="策略名称"
          >
            {getFieldDecorator('PolicyName', {
              ...PolicyNameRules,
              initialValue: initialValue.PolicyName
            })(
              <Input maxLength={64} placeholder="英文大小写、数字、+=,.@-_，限长64字符" id="policyName" disabled={status !== 'create'} />
            )}

          </FormItem>
          <FormItem
            {...formItemLayout}
            label="备注"
          >
            {getFieldDecorator('Description', {
              rules: [
                { max: 128, message: '限制长度128字符' }
              ],
              initialValue: initialValue.Description
            })(
              <Input maxLength={128} placeholder="中英文、数字、特殊字符均可，限长128字符" id="desc" disabled={status === 'read'} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            style={{ marginBottom: '0px' }}
            label="编辑策略内容"
          >
            <div id="jsoneditor" key={status} ref={this.onGetRef} style={{ width: '442px', height: '300px' }} />
          </FormItem>
          <FormItem
            wrapperCol={{ span: 12, offset: 5 }}
          >
            <div><a href="https://vcloud.bytedance.net/docs/7/542/" target='blank'>授权策略格式定义</a></div>
          </FormItem>
          <FormItem
            {...formItemLayout}
            style={{ marginBottom: '0px' }}
            label="服务名"
          >
            {getFieldDecorator('Category', {
              rules: [
                { required: true, message: '请选择服务', },
              ],
              initialValue: initialValue.Category ? initialValue.Category :
                (listServices && listServices[0] ? listServices[0].ServiceShortName : '')
            })(
              <Select
                disabled={status === 'read'}
                showSearch
                style={{ width: 200 }}
                placeholder="全部服务"
                optionFilterProp="children"
                onChange={this.select}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {listServices.map(ele => {
                  return <Option key={ele.ServiceShortName} value={ele.ServiceShortName}>{ele.ServiceName}</Option>;
                })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            style={{ marginBottom: '0px' }}
            label="上下线"
          >
            <Switch checked={this.state.statusChecked} disabled={status === 'read' || this.state.statusLock} onChange={e => {
              if (!e) {
                this.setState({
                  statusChecked: false
                });
                return;
              }
              let self = this;
              confirm({
                title: '确定打开吗？',
                content: '此功能上线后，前台用户可以直接使用，且暂时不支持下线 ，请确认配置无误后再上线',
                onOk() {
                  self.setState({
                    //statusLock: status === 'update',
                    statusChecked: true
                  });
                }
              });
            }} />
          </FormItem>
        </Modal>
      </div>
    );
  }
}

const FormModal = Form.create()(QueryModal);
export default FormModal;