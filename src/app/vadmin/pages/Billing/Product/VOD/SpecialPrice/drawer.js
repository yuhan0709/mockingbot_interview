import React, { Component } from 'react';
import { Drawer, Button, Form, Input, DatePicker, Radio, Transfer, message } from 'antd';
import moment from 'moment';
import DrawerForms from '../drawerForms/index';
import Apis from '../../../../../util/request';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const titleMap = {
  create: '添加特殊定价',
  update: '编辑特殊定价',
  read: '查看特殊定价'
};

class AddDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      targetKeys: [],
      selectedKeys: [],
      categories: [],
      initialValue: {}
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible) {
      this.BillingMethodSets = [];
      let { initialValue } = nextProps;
      const create = nextProps.status === 'create';
      const targetKeys = [];
      if (create) {
        initialValue = nextProps.ProductGroupMetadata;
      }
      const payType = initialValue.PayType;
      initialValue.BillingMethodSets.forEach(bms => {
        targetKeys.push(bms.Category);
      });
      this.setState({
        initialValue,
        targetKeys,
        selectedKeys: [],
        payType,
      });
      this.getCategories();
    }
  }

  getCategories = async () => {
    const bmc = (await Apis.ListBillingMethodCategories()).BillingMethodCategories;
    const categories = [];
    bmc.forEach(key => {
      categories.push({
        key,
        value: window.INIT_CONFIG.expenseConfig.BillingMethodCategory[key],
      });
    });
    this.setState({
      categories,
    });
  }

  confirm = () => {
    this.props.form.validateFields( async (err, values) => {
      if (!err) {
        values.BillingMethodSets = JSON.stringify(this.BillingMethodSets);
        values.BeginTime = values.time[0].toISOString();
        values.EndTime = values.time[1].toISOString();
        delete values.billings;
        delete values.time;
        values = {
          ...this.state.initialValue,
          ...values,
          ProductGroupId: this.state.initialValue.Id,
        };
        if (this.props.status === 'create') {
          await Apis.CreateProductGroup(values);
          message.success('特殊定价添加成功');
        } else {
          await Apis.UpdateProductGroup(values);
          message.success('特殊定价修改成功');
        }
        this.props.confirm();
        this.onClose();
      }
    });
  }

  onClose = () => {
    this.props.form.resetFields();
    this.props.onClose();
  }

  handleChange = (nextTargetKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
  }

  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
  }

  render() {
    const formItemLayout = {
      labelCol: {
        sm: { span: 5 },
      },
      wrapperCol: {
        sm: { span: 19 },
      },
    };
    const { getFieldDecorator } = this.props.form;
    const { targetKeys, selectedKeys, categories } = this.state;
    const { initialValue } = this.state;
    const read = this.props.status === 'read';
    const create = this.props.status === 'create';
    return (
      <Drawer
        title={titleMap[this.props.status]}
        width={620}
        closable={false}
        onClose={this.onClose}
        visible={this.props.visible}
      >
        <Form className="login-form">
          <FormItem
            {...formItemLayout}
            label="用户ID"
          >
            {getFieldDecorator('AccountId', {
              rules: [{
                required: true,
                message: '请输入用户ID',
              }, {
                pattern: /^\w+$/g,
                message: '只允许使用字母、数字、下划线'
              },{
                validator: async function(_, AccountId, callback) {
                  if (!AccountId) {
                    callback();
                    return;
                  }
                  const res = await Apis.GetAccountInfo({ AccountId });
                  if (res.length > 0) {
                    callback();
                  } else {
                    callback(new Error());
                  }
                },
                message: '用户不存在'
              }],
              initialValue: initialValue.AccountId ? initialValue.AccountId : '',
              getValueFromEvent: val => {
                val = val.target.value.slice(0,32);
                return val;
              },
            })(
              <Input placeholder="请输入用户ID" disabled={!create}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="线下合作周期"
          >
            {getFieldDecorator('time', {
              rules: [{
                required: true,
                message: '请输入时间',
              }],
              initialValue: [moment.unix(initialValue.BeginTime), moment.unix(initialValue.EndTime)],
            })(
              <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" disabled={read}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="上线状态"
          >
            {getFieldDecorator('Status', {
              initialValue: initialValue.Status + '',
            })(
              <RadioGroup disabled={read}>
                <Radio value='1'>上线</Radio>
                <Radio value='0'>下线</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="计费项组合"
          >
            {getFieldDecorator('billings',{
              rules: [{
                required: true,
                message: '请添加计费项',
              }],
              initialValue: targetKeys,
            })(
              <Transfer
                disabled={read}
                dataSource={categories}
                titles={['待选', '已选']}
                targetKeys={targetKeys}
                selectedKeys={selectedKeys}
                onChange={this.handleChange}
                onSelectChange={this.handleSelectChange}
                render={item => item.value}
              />
            )}
          </FormItem>
        </Form>
        <DrawerForms
          read={read}
          initialValue={this.state.initialValue}
          PayType={this.state.payType}
          BilingMethodCategory={targetKeys}
          onChange={BillingMethodSets => {
            this.BillingMethodSets = BillingMethodSets;
          }}
        />
        <br /><br />
        {
          this.props.status !== 'read' ?
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e8e8e8',
                padding: '10px 16px',
                textAlign: 'right',
                left: 0,
                background: '#fff',
                borderRadius: '0 0 4px 4px',
              }}
            >
              <Button
                style={{
                  marginRight: 8,
                }}
                onClick={this.onClose}
              >
              取消
              </Button>
              <Button onClick={this.confirm} type="primary">确定</Button>
            </div>
            : ''
        }
      </Drawer>
    );
  }
}
const AddDrawerForm = Form.create()(AddDrawer);
export default AddDrawerForm;