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
      let data = [];
      const unit = '元/GB' + billingMap.cdn.unitMap[target.SettlementPeriod];
      target.BillingMethodMap.screenshot.Value.forEach(region => {
        data.push({
          region: region.DisplayName,
          price: region.Func.Price,
          unit,
        });
      });
      this.setState({
        data,
      });
    }
  }

  columns = [
    colFormat('地区', 'region'),
    colFormat('价格', 'price'),
    colFormat('单位', 'unit')
  ]

  render() {
    return (
      <div>
        <Table
          rowKey="region"
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