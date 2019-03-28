import React, { Component } from 'react';
import { Table } from 'antd';
import { colFormat } from '@util/index';

class App extends Component {
  constructor(props) {
    super(props);
  }

  state = {}

  componentDidMount() {
    this.formData(this.props);
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    this.formData(nextProps);
  }

  formData = props => {
    if (props.visible) {
      const { target, billingMap } = props;
      const data = [];
      const unit = '元/GB' + billingMap.cdn.unitMap[target.SettlementPeriod];
      const columns = [];
      target.BillingMethodMap.storage.Value.forEach(region => {
        columns.push(colFormat(region.DisplayName, region.Key));
      });
      target.BillingMethodMap.storage.Value[0].Func.DisplayName.split(',').forEach(gradient => {
        data.push({
          gradient,
          unit,
        });
      });
      target.BillingMethodMap.storage.Value.forEach(region => {
        region.Func.Price.split(',').forEach((price,index) => {
          data[index][region.Key] = price;
        });
      });
      this.setState({
        data,
        columns: [this.columns[0], ...columns, this.columns[1]]
      });
    }
  }

  columns = [
    colFormat('梯度', 'gradient'),
    colFormat('单位', 'unit')
  ]

  render() {
    return (
      <div>
        <Table
          rowKey="gradient"
          size="small"
          bordered
          dataSource={this.state.data}
          columns={this.state.columns}
          pagination={false}
        />
      </div>
    );
  }
}

export default App;