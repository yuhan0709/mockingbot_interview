import React, { Component } from 'react';
import { Modal, Form, Input, Alert, message } from 'antd';
import Apis from '../../../../../../../util/request';
import { withRouter } from 'react-router';

const FormItem = Form.Item;

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
      this.props.form.resetFields();
      this.setState({
        visible: true
      });
    }
  }

  confirm = () => {
    this.props.form.validateFields( async (err, values) => {
      if (!err) {
        const target = JSON.parse(JSON.stringify(this.props.target));
        const BillingMethodCombination = target.BillingMethodCombination;
        const regions = BillingMethodCombination[BillingMethodCombination.findIndex(bm => bm.Key === 'CDN')].Value;
        regions[regions.findIndex(region => region.Key === this.props.data.Key)].Func.Price = values.Price.split(',').map(price => price - 0) + '';
        if (this.props.match.params.accountID !== 'add') {
          await Apis.UpdateProducts({
            ProductGroupId: target.ProductGroupId,
            Info: [
              {
                Status: target.Status,
                ProductId: target.Id,
                BillingMethodSet: BillingMethodCombination,
              }
            ]
          });
          message.success('修改成功');
          this.props.update();
        } else {
          this.props.setTarget(target);
        }
        this.cancel();
      }
    });
  }

  cancel = () => {
    this.setState({
      visible: false
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 4 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 20 },
        sm: { span: 20 },
      },
    };

    if (!this.state.visible) {
      return <div></div>;
    }

    const { data, target, billingMap }  = this.props;
    const unitMap = billingMap.unitMap;
    return (
      <div>
        <Modal
          width={700}
          title="视频分发"
          visible={this.state.visible}
          onOk={this.confirm}
          onCancel={this.cancel}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label="计费法"
            >
              {billingMap[target.SettlementPeriod][data.Func.FuncName]}({data.DisplayName})
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="梯度"
            >
              {data.Func.DisplayName.split(':')[1]}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="对应报价"
            >
              {getFieldDecorator('Price', {
                rules: [{
                  validator: (_, price, callback) => {
                    if (!price
                      || price.split(',').length === this.props.data.Func.Interval.split(',').length + 1
                    ) {
                      callback();
                      return;
                    }
                    callback(new Error());
                  },
                  message: '请输入正确的区间价格'
                }],
                initialValue: data.Func.Price,
              })(
                <Input style={{ width: 400 }} placeholder='请填入价格,用英文逗号隔开'/>
              )}&nbsp;&nbsp;元{unitMap[data.Func.FuncName] + unitMap[target.SettlementPeriod]}
            </FormItem>
            <FormItem>
              <Alert
                message='示例'
                description='若梯度为“区间A,区间B,区间C”，则价格填“价格A,价格B,价格C”三个数字对应到梯度，各梯度价格之间用英文逗号分隔'
                type='warning'
              />
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
const fcQueryModal = Form.create()(QueryModal);
export default fcQueryModal;