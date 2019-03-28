import React, { Component } from 'react';
import { Modal, Form, InputNumber, message } from 'antd';
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
        const regions = BillingMethodCombination[BillingMethodCombination.findIndex(bm => bm.Key === 'Screenshot')].Value;
        Object.keys(values).forEach(key => {
          regions[regions.findIndex(region => region.Key === key)].Func.Price = values[key];
        });
        if (this.props.match.params.accountID !== 'add') {
          await Apis.UpdateProducts({
            ProductGroupId: this.props.target.ProductGroupId,
            Info: [
              {
                Status: this.props.target.Status,
                ProductId: this.props.target.Id,
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
        xs: { span: 6 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 18 },
        sm: { span: 18 },
      },
    };

    if (!this.state.visible) {
      return <div></div>;
    }

    const { data, target, billingMap } = this.props;
    return (
      <div>
        <Modal
          width={600}
          title="视频截图"
          visible={this.state.visible}
          onOk={this.confirm}
          onCancel={this.cancel}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label="计费法"
            >
              {billingMap[target.SettlementPeriod]}
            </FormItem>
            {data.Value.map(ele => (
              <FormItem
                key={ele.Key}
                {...formItemLayout}
                label={ele.DisplayName}
              >
                {getFieldDecorator(ele.Key, {
                  initialValue: ele.Func.Price,
                })(
                  <InputNumber min={0} style={{ width: 200 }} placeholder='请填入价格'/>
                )}&nbsp;&nbsp;元/千张
              </FormItem>
            ))}
          </Form>
        </Modal>
      </div>
    );
  }
}
const fcQueryModal = Form.create()(QueryModal);
export default fcQueryModal;