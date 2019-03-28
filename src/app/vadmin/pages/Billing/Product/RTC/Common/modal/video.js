import React, { Component } from 'react';
import { Modal, message, InputNumber } from 'antd';
import Apis from '../../../../../../util/request';
import { withRouter } from 'react-router';

@withRouter
class QueryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  UNSAFE_componentWillReceiveProps = async (nextProps) => {
    if (this.props.visible !== nextProps.visible) {

      const billingMethod = JSON.parse(JSON.stringify(nextProps.data.BillingMethodCombination[nextProps.target]));

      const expenseConfig = window.INIT_CONFIG.expenseConfig;
      const title = expenseConfig.CommonService2['rtc'].columns[nextProps.target].name;
      const unit = expenseConfig.CommonService2['rtc'].columns[nextProps.target].unit;
      this.setState({
        title,
        visible: true,
        billingMethod,
        unit
      });
    }
  }

  confirm = async () => {
    const BillingMethodCombination = JSON.parse(JSON.stringify(this.props.data.BillingMethodCombination));
    BillingMethodCombination[this.props.target] = this.state.billingMethod;

    await Apis.UpdateProducts({
      ProductGroupId: this.props.data.ProductGroupId,
      Info: [
        {
          Status: this.props.data.Status,
          ProductId: this.props.data.Id,
          BillingMethodSet: BillingMethodCombination,
        }
      ]
    });
    message.success('修改成功');
    this.props.update();
    this.cancel();
  }

  cancel = () => {
    this.setState({
      visible: false
    });
  }

  render() {
    if (!this.state.visible) {
      return <div></div>;
    }
    return (
      <div>
        <Modal
          title={this.state.title}
          visible={this.state.visible}
          onOk={this.confirm}
          onCancel={this.cancel}
        >
          您当前正在修改{this.props.data.Id}的{this.state.title}：
          <br /><br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{window.INIT_CONFIG.expenseConfig.Region['cn-north-1']}(720p以上)：
          <InputNumber
            min={0}
            placeholder="请输入价格"
            value={this.state.billingMethod['cn-north-1'].HD.Value}
            onChange={price => {
              let billingMethod = { ...this.state.billingMethod };
              billingMethod['cn-north-1'].HD.Value = price;
              this.setState({
                billingMethod
              });
            }}
          />
          &nbsp;&nbsp;&nbsp;
          {this.state.unit} <br /><br />
          &nbsp;&nbsp;&nbsp;&nbsp;{window.INIT_CONFIG.expenseConfig.Region['cn-north-1']}(720p及以下)：
          <InputNumber
            min={0}
            placeholder="请输入价格"
            value={this.state.billingMethod['cn-north-1'].SD.Value}
            onChange={price => {
              let billingMethod = { ...this.state.billingMethod };
              billingMethod['cn-north-1'].SD.Value = price;
              this.setState({
                billingMethod
              });
            }}
          />
          &nbsp;&nbsp;&nbsp;
          {this.state.unit} <br /><br />
          &nbsp;&nbsp;&nbsp;&nbsp;{window.INIT_CONFIG.expenseConfig.Region['ap-singapore-1']}(720p以上)：
          <InputNumber
            min={0}
            placeholder="请输入价格"
            value={this.state.billingMethod['ap-singapore-1'].HD.Value}
            onChange={price => {
              let billingMethod = { ...this.state.billingMethod };
              billingMethod['ap-singapore-1'].HD.Value = price;
              this.setState({
                billingMethod
              });
            }}
          />
          &nbsp;&nbsp;&nbsp;
          {this.state.unit} <br /><br />
          {window.INIT_CONFIG.expenseConfig.Region['ap-singapore-1']}(720p及以下)：
          <InputNumber
            min={0}
            placeholder="请输入价格"
            value={this.state.billingMethod['ap-singapore-1'].SD.Value}
            onChange={price => {
              let billingMethod = { ...this.state.billingMethod };
              billingMethod['ap-singapore-1'].SD.Value = price;
              this.setState({
                billingMethod
              });
            }}
          />
          &nbsp;&nbsp;&nbsp;
          {this.state.unit}
        </Modal>
      </div>
    );
  }
}

export default QueryModal;