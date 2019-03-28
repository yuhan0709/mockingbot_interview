import React, { Component } from 'react';
import { Drawer, Button, Select, Form, Input, DatePicker, Radio, Transfer, message } from 'antd';
import moment from 'moment';
import DrawerForms from '../drawerForms/index';
import Apis from '../../../../../util/request';

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const titleMap = {
  create: '添加商品组',
  update: '编辑商品组',
};
const PayType = window.INIT_CONFIG.expenseConfig.PayType;
const initPayType = PayType ? Object.keys(PayType)[0] : '';
const ListBusiness = [
  { ShortName: 'vod', Name: '视频点播' },
  { ShortName: 'live', Name: '视频直播' },
  { ShortName: 'rtc', Name: '实时通信' },
];
class AddDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      targetKeys: [],
      selectedKeys: [],
      categories: [],
      payType: initPayType,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible) {
      this.BillingMethodSets = [];
      const { initialValue } = nextProps;
      const update = nextProps.status === 'update';
      let targetKeys = [], payType = initPayType;
      if (update) {
        initialValue.BillingMethodSets.forEach(bms => {
          targetKeys.push(bms.Category);
        });
        payType = initialValue.PayType;
      }
      this.setState({
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
        if (this.props.status === 'update') {
          values = {
            ...this.props.initialValue,
            ...values,
            ProductGroupId: this.props.initialValue.Id,
          };
          await Apis.UpdateProductGroup(values);
          message.success('商品组修改成功');
        } else {
          values = {
            ...values,
            AccountId: '0',
          };
          await Apis.CreateProductGroup(values);
          message.success('商品组添加成功');
        }
        this.props.confirm();
        this.onClose();
      }
    });
  }

  handleChange = (nextTargetKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
  }

  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
  }

  onClose = () => {
    this.props.form.resetFields();
    this.props.onClose();
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
    const { initialValue } = this.props;
    const update = this.props.status === 'update';
    const expenseConfig = window.INIT_CONFIG.expenseConfig;
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
            label="产品名称"
          >
            {getFieldDecorator('Service', {
              rules: [{
                required: true,
                message: '请选择产品',
              }],
              initialValue: update ? initialValue.Service : '',
            })(
              <Select
                disabled={update}
                showSearch
              >
                {
                  ListBusiness.map(business =>
                    <Option
                      key={business.ShortName}
                      value={business.ShortName}
                    >
                      {business.Name}
                    </Option>
                  )
                }
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="商品组名称"
          >
            {getFieldDecorator('ProductName', {
              rules: [{
                required: true,
                message: '请输入商品名称',
              }, {
                pattern: /^[\u4e00-\u9fa5_a-zA-Z]+$/,
                message: '只允许使用中文、英文字母'
              }],
              initialValue: update ? initialValue.ProductName : '',
              getValueFromEvent: val => {
                val = val.target.value.slice(0,20);
                return val;
              },
            })(
              <Input placeholder="请输入商品组名称"  disabled={update}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="商品组类型"
          >
            {getFieldDecorator('PayType', {
              initialValue: update ? initialValue.PayType : initPayType,
              getValueFromEvent: payType => {
                this.setState({
                  payType
                });
                return payType;
              },
            })(
              <Select style={{ width: 120 }}  disabled={update}>
                {Object.keys(expenseConfig.PayType).map(key => {
                  return <Option key={key} value={key}>{expenseConfig.PayType[key]}</Option>;
                })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="区域"
          >
            {getFieldDecorator('Region', {
              initialValue: update ? initialValue.Region : Object.keys(expenseConfig.Region)[0],
            })(
              <Select style={{ width: 120 }}  disabled={update}>
                {Object.keys(expenseConfig.Region).map(key => {
                  return <Option key={key} value={key}>{expenseConfig.Region[key]}</Option>;
                })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="有效时间"
          >
            {getFieldDecorator('time', {
              rules: [{
                required: true,
                message: '请输入时间',
              }],
              initialValue: update ? [moment.unix(initialValue.BeginTime), moment.unix(initialValue.EndTime)] : '',
            })(
              <RangePicker showTime format="YYYY-MM-DD HH:mm:ss"/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="上线状态"
          >
            {getFieldDecorator('Status', {
              initialValue: update ? initialValue.Status + '' : '0',
            })(
              <RadioGroup>
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
              initialValue: update ? targetKeys : [],
            })(
              <Transfer
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
          initialValue={update ? initialValue : []}
          PayType={this.state.payType}
          BilingMethodCategory={targetKeys}
          onChange={BillingMethodSets => {
            this.BillingMethodSets = BillingMethodSets;
          }}
        />
        <br /><br />
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
      </Drawer>
    );
  }
}
const AddDrawerForm = Form.create()(AddDrawer);
export default AddDrawerForm;