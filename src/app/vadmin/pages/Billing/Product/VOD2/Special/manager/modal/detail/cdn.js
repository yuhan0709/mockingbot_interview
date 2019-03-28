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
      const { target, billingMap, billingMethod } = props;
      const data = [];
      const unit = '元' + billingMap.cdn.unitMap[billingMethod.FuncName] + billingMap.cdn.unitMap[target.SettlementPeriod];
      billingMethod.DisplayName.split(':')[1].split(',').forEach(gradient => {
        data.push({
          gradient,
          unit,
        });
      });
      billingMethod.Price.split(',').forEach((price, index) => {
        data[index].price = price;
      });
      this.setState({
        data
      });
    }
  }

  columns = [
    colFormat('梯度', 'gradient'),
    colFormat('价格', 'price'),
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
          columns={this.columns}
          pagination={false}
        />
      </div>
    );
  }
}

export default App;