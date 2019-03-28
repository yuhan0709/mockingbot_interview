import React, { Component } from 'react';
import EasyForm from '@component/EasyForm';
import { Modal, Select, Form, DatePicker, Tabs, message } from 'antd';
import PropTypes from 'prop-types';
// import style from './index.less';
import Request from '../../util/request';
import { existConfig, getExpenseConfig } from '../../util';
import moment from 'moment';

const {
  GetProductByInstance
} = Request;

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const EasyFormItem = EasyForm.Item;
const TabPane = Tabs.TabPane;

const initialValueMap = {
  TimeRange: []
};
const itemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15, offset: 1 },
};

@EasyForm.create()
class FederationForm extends Component {
  state = {
    tab: '启用测试',
    products: [],
    billMethod: false
  }
  static propTypes = {
    isEdit: PropTypes.bool,
    isView: PropTypes.bool,
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
    visible: false,
    confirmLoading: false,
    initialValueMap,
    dataSource: {},
    onOk: () => {
    },
    onCancel: () => {
    }
  }

  formConfig = {}

  tryFormConfig = {
    TimeRange: {
      itemProps: {
        ...itemLayout,
        label: <span>测试时间</span>,
        getFieldFParam: {
          name: 'TimeRange',
          config: {
            rules: [{
              required: true,
              message: '不能为空',
            }],
            initialValue: [moment(this.props.dataSource.TestBeginTime * 1000),moment(this.props.dataSource.TestEndTime * 1000)],
          }
        },
      },
      children: <RangePicker showTime format="YYYY-MM-DD HH:mm:ss"/>,
    },
  }

  async componentDidMount() {
    const dataSource = this.props.dataSource;
    if (dataSource.Id) {
      try {
        const { methods, initMethods, products } = await GetProductByInstance({
          ProductId: dataSource.ProductId,
          AccountId: dataSource.AccountId
        });
        this.genForm(methods, initMethods);
        this.setState({
          billMethod: true,
          products
        });
      } catch (_) {
        this.setState({
          billMethod: false
        });
      }
    }
  }

  // 动态生成表单
  genForm = (methods = {}, initMethods = {}) => {
    const BillingMethodCategory = getExpenseConfig().BillingMethodCategory;
    // console.log(methods, initMethods, BillingMethodCategory);
    if (BillingMethodCategory && Object.keys(methods).length > 0 && existConfig()) {
      const BillingMethod = window.INIT_CONFIG.expenseConfig.BillingMethod || window.INIT_CONFIG.expenseConfig.BillingMethodName;
      Object.keys(methods).forEach(key => {
        this.formConfig[key] =
          {
            itemProps: {
              ...itemLayout,
              label: BillingMethodCategory[key],
              getFieldFParam: {
                name: key,
                config: {
                  rules: [{
                    required: true,
                    message: '不能为空',
                  }],
                  initialValue: initMethods[key],
                }
              }
            },
            children: (
              <Select>
                {methods[key] && methods[key].map(item => {
                  return <Option key={item.Id} value={item.Id}>{BillingMethod[item.Id]}</Option>;
                })}
              </Select>
            )
          };
      });

      this.formConfig.BeginTime = {
        itemProps: {
          ...itemLayout,
          label: '生效时间',
          getFieldFParam: {
            name: 'BeginTime',
            config: {
              rules: [{
                required: true,
                message: '不能为空',
              }],
              initialValue: this.props.initialValueMap.BeginTime,
            }
          },
        },
        children: <DatePicker/>,
      };
    } else {
      message.error('实例管理表单数据获取出错，请联系管理员！');
      // this.props.onCancel();
    }
  }

  handleTabChange = (tab) => {
    this.setState({
      tab: tab
    });
  }

  formatData(formConfig) {
    const values = this.props.form.getFieldsValue();
    const format = {};
    Object.keys(values).forEach(key => {
      let value = values[key];
      if (typeof value === 'string') value = value.trim();
      if (formConfig[key] && formConfig[key].formatValue) {
        format[key] = formConfig[key].formatValue(value);
      } else format[key] = value;
    });
    return format;
  }

  onOk = () => {
    const formConfig = this.state.tab === '启用测试' ? this.tryFormConfig : this.formConfig;

    this.props.form.validateFields((err) => {
      if (!err) this.props.onOk({
        ...this.formatData(formConfig),
        tab: this.state.tab,
        products: this.state.products,
        id: this.props.dataSource.Id
      });
    });
  }

  render() {
    return (
      <Modal
        title={'实例管理'}
        width={600}
        visible={this.props.visible}
        onOk={this.onOk}
        onCancel={this.props.onCancel}
        confirmLoading={this.props.confirmLoading}
        footer={this.props.isView ? null : undefined}
        destroyOnClose
      >
        <Tabs defaultActiveKey={this.state.tab} onChange={this.handleTabChange}>
          {this.state.billMethod && <TabPane tab="更改计费法" key="更改计费法">
            {this.state.tab === '更改计费法' ? <Form layout="horizontal">
              {
                Object.keys(this.formConfig).map(itemKey => {
                  return (
                    <EasyFormItem key={itemKey} {...this.formConfig[itemKey].itemProps}>
                      {this.formConfig[itemKey].children}
                    </EasyFormItem>);
                })
              }
            </Form> : null}
          </TabPane>}
          <TabPane tab="启用测试" key="启用测试">
            {this.state.tab === '启用测试' ? <Form layout="horizontal">
              {
                Object.keys(this.tryFormConfig).map(itemKey => {
                  return (
                    <EasyFormItem key={itemKey} {...this.tryFormConfig[itemKey].itemProps}>
                      {this.tryFormConfig[itemKey].children}
                    </EasyFormItem>);
                })
              }
            </Form> : null}
          </TabPane>
        </Tabs>
      </Modal>
    );
  }

}

export default FederationForm;