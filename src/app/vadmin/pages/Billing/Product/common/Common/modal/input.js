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
      const billingMethod = nextProps.data.BillingMethodCombination[
        nextProps.data.BillingMethodCombination.findIndex(bm => bm.Key === nextProps.target)
      ];
      const expenseConfig = window.INIT_CONFIG.expenseConfig;
      const title = expenseConfig.CommonService[nextProps.match.params.service].columns[nextProps.target].name;
      const unit = expenseConfig.CommonService[nextProps.match.params.service].columns[nextProps.target].unit;
      this.setState({
        title,
        visible: true,
        Price: billingMethod.Func.Price,
        unit
      });
    }
  }

  confirm = async () => {
    const BillingMethodCombination = JSON.parse(JSON.stringify(this.props.data.BillingMethodCombination));
    const regions = BillingMethodCombination[BillingMethodCombination.findIndex(bm => bm.Key === this.props.target)];
    regions.Func.Price = this.state.Price;
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
          单价：
          <InputNumber
            min={0}
            placeholder="请输入价格"
            value={this.state.Price}
            onChange={Price => {
              this.setState({
                Price,
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