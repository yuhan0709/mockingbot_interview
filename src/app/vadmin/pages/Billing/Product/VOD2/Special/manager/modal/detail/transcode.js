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
      const transcode = props.target.BillingMethodMap.transcode.Value;
      const data = [];
      const columns = [];
      transcode.forEach(region => {
        columns.push(
          colFormat(region.DisplayName, region.Key)
        );
      });
      transcode[0].Value.forEach(codec => {
        codec.Func.DisplayName.split(',').forEach(section => {
          data.push({
            key: codec.Key + section,
            codec: props.billingMap.common[codec.Key],
            section,
            unit: '元/min'
          });
        });
      });
      transcode.forEach(region => {
        let i = 0;
        region.Value.forEach(codec => {
          codec.Func.Price.split(',').forEach(price => {
            data[i][region.Key] = price;
            i++;
          });
        });
      });
      this.setState({
        columns: [this.columns[0], this.columns[1], ...columns, this.columns[2]],
        data,
      });
    }
  }

  columns = [
    colFormat('转码标准', 'codec'),
    colFormat('转码规格', 'section'),
    colFormat('单位', 'unit')
  ]

  render() {
    return (
      <div>
        <Table
          rowKey="key"
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