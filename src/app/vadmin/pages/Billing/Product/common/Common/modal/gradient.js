import React, { Component } from 'react';
import { Modal, message, Input, Alert } from 'antd';
import Apis from '../../../../../../util/request';
import { withRouter } from 'react-router';
import FormsTable from '@component/FormsTable';


@withRouter
class QueryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      editingKey: [],
      data: [],
    };
  }

  UNSAFE_componentWillReceiveProps = async (nextProps) => {
    if (this.props.visible !== nextProps.visible) {
      const billingMethod = nextProps.data.BillingMethodCombination[
        nextProps.data.BillingMethodCombination.findIndex(bm => bm.Key === nextProps.target)
      ];
      const expenseConfig = window.INIT_CONFIG.expenseConfig;
      const title = expenseConfig.CommonService[nextProps.match.params.service].columns[nextProps.target].name;
      const gradientUnit = expenseConfig.CommonService[nextProps.match.params.service].columns[nextProps.target].gradientUnit;
      const editingKey = [];
      const data = [];
      let interval;
      billingMethod.Value.forEach(region => {
        const key = region.Key;
        editingKey.push(key);
        interval = region.Func.Interval;
        data.push({
          key,
          region: expenseConfig.Region[region.Key] ? expenseConfig.Region[region.Key] : region.Key,
          interval: region.Func.Interval,
          price: region.Func.Price,
          unit: expenseConfig.CommonService[nextProps.match.params.service].columns[nextProps.target].unit,
        });
      });
      this.setState({
        gradientUnit,
        title,
        visible: true,
        editingKey,
        data,
        interval
      });
    }
  }

  forms = {}

  columns = [{
    title: '地区',
    dataIndex: 'region',
    key: 'region',
  },{
    title: '单价',
    dataIndex: 'price',
    key: 'price',
    cell: (
      <Input />
    ),
    getFieldDecorator: (form, record) => {
      this.forms[record.key] = form;
      const { getFieldDecorator } = form;
      return getFieldDecorator('price', {
        rules: [{
          required: true,
          message: '请输入价格',
        }],
        initialValue: record.price,
      });
    }
  },{
    title: '单位',
    dataIndex: 'unit',
    key: 'unit',
  }
  ]

  validateFields = form => {
    return new Promise((resolve, reject) => {
      form.validateFields( async (err, values) => {
        if (err) {
          reject(err);
        } else {
          resolve(values);
        }
      });
    });
  }

  confirm = async () => {
    const values = {};
    for (let key in this.forms) {
      const value = await this.validateFields(this.forms[key]);
      values[key] = value;
    }
    const BillingMethodCombination = JSON.parse(JSON.stringify(this.props.data.BillingMethodCombination));
    const regions = BillingMethodCombination[BillingMethodCombination.findIndex(bm => bm.Key === this.props.target)].Value;
    regions.forEach(region => {
      region.Func.Price = values[region.Key].price;
      region.Func.Interval = this.state.interval;
      if (region.Func.Price.split(',').length - 1 !== region.Func.Interval.split(',').length) {
        message.error('梯度区间与价格不匹配');
        throw new Error();
      }
    });
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
    const gradientUnit = this.state.gradientUnit;
    return (
      <div>
        <Modal
          width={600}
          title={this.state.title}
          visible={this.state.visible}
          onOk={this.confirm}
          onCancel={this.cancel}
        >
          您当前正在修改{this.props.data.Id}的{this.state.title}：
          <br /><br />
          梯度：<Input
            style={{ width: 300, marginRight: 10 }}
            placeholder="请输入梯度，用逗号分隔"
            value={this.state.interval}
            onChange={e => {
              this.setState({
                interval: e.target.value
              });
            }}
          /> {gradientUnit}
          <br /><br />
          <FormsTable
            scroll={{ x: 1 }}
            columns={this.columns}
            editingKey={this.state.editingKey}
            dataSource={this.state.data}
          />
          <br />
          <Alert
            message='示例'
            description={`若梯度填写“10,100”，则代表梯度区间为“0~10${gradientUnit}(含),10${gradientUnit}~100${gradientUnit}(含),大于100${gradientUnit}”，价格需要填写“价格A,价格B,价格C”三个数字对应到梯度区间，价格之间用英文逗号分隔`}
            type='warning'
          />
        </Modal>
      </div>
    );
  }
}

export default QueryModal;