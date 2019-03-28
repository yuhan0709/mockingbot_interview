import React, { Component } from 'react';
import { Modal, Form, InputNumber, message } from 'antd';
import Apis from '../../../../../../util/request';
import FormsTable from '@component/FormsTable';

class QueryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      columns: [],
      editingKey: [],
      data: [],
    };
  }

  UNSAFE_componentWillReceiveProps = async (nextProps) => {
    if (this.props.visible !== nextProps.visible) {
      this.forms = [];
      const data = [];
      const columns = [];
      const editingKey = [];
      nextProps.data.Value.forEach(region => {
        columns.push({
          title: window.INIT_CONFIG.expenseConfig.Region[region.Key],
          dataIndex: region.Key,
          key: region.Key,
          cell: (
            <InputNumber min={0} />
          ),
          getFieldDecorator: (form, record) => {
            this.forms[record.key] = form;
            const { getFieldDecorator } = form;
            return getFieldDecorator(region.Key, {
              rules: [{
                required: true,
                message: '请输入价格',
              }],
              initialValue: record[region.Key],
            });
          }
        });
      });
      nextProps.data.Value[0].Value.forEach(codecs => {
        const Codec = codecs.Key;
        const codecNameMap = codecs.Func.DisplayName.split(',');
        for (let i = 0; i <= codecs.Func.Interval.split(',').length; i++ ) {
          const DisplayName = codecNameMap[i];
          const key = Codec + '$$$$' + DisplayName;
          editingKey.push(key);
          data.push({
            key,
            Codec: nextProps.billingMap[Codec],
            DisplayName,
            unit: '元/min'
          });
        }
      });
      nextProps.data.Value.forEach(region => {
        let i = 0;
        region.Value.forEach(codec => {
          codec.Func.Price.split(',').forEach(val => {
            const ele = data[i];
            ele[region.Key] = val;
            i++;
          });
        });
      });
      this.setState({
        data,
        columns: [this.columns[0],this.columns[1], ...columns,this.columns[2]],
        editingKey,
        visible: true
      });
    }
  }

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
      let ks = key.split('$$$$');
      !values[ks[0]] && (values[ks[0]] = {});
      values[ks[0]][ks[1]] = value;
    }
    const BillingMethodCombination = JSON.parse(JSON.stringify(this.props.target.BillingMethodCombination));
    const regions = BillingMethodCombination[BillingMethodCombination.findIndex(bm => bm.Key === 'Transcode')].Value;
    regions.forEach(region => {
      region.Value.forEach(codec => {
        codec.Func.Price = codec.Func.DisplayName.split(',').map(name => values[codec.Key][name][region.Key]) + '';
      });
    });
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
    this.cancel();
  }

  cancel = () => {
    this.setState({
      visible: false
    });
  }

  columns = [
    {
      title: '转码标准',
      dataIndex: 'Codec',
      key: 'Codec',
      width: 80,
    },{
      title: '转码规则',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
      width: 100,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    }
  ]


  forms = {}

  render() {
    if (!this.state.visible) {
      return <div></div>;
    }
    const { target, billingMap } = this.props;
    return (
      <div>
        <Modal
          width={800}
          title="视频转码"
          visible={this.state.visible}
          onOk={this.confirm}
          onCancel={this.cancel}
        >
          计费法：{billingMap[target.SettlementPeriod]}
          <br /><br />
          <FormsTable
            scroll={{ x: 1 }}
            columns={this.state.columns}
            editingKey={this.state.editingKey}
            dataSource={this.state.data}
          />
        </Modal>
      </div>
    );
  }
}
const fcQueryModal = Form.create()(QueryModal);
export default fcQueryModal;