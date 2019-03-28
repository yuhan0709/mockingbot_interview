import React, { Component } from 'react';
import { Table } from 'antd';
import { colFormat } from '@util/index';
import Link from '@component/Link';
import { gerService } from '../../../util';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [{ Name: 'all', ProductName: '全部' },...gerService('bill')]
    };
  }

  columns = [
    colFormat('服务名称', 'Name'),
    colFormat('产品名称', 'ProductName', (pName, rowData) => {
      if (pName) {
        return pName;
      }
      return window.INIT_CONFIG.expenseConfig.Service[rowData.Name];
    }),
    colFormat('操作', 'chosen', (_, rowData) => {
      return (
        <Link to={`./all/#service=${rowData.Name}`}>账单管理</Link>
      );
    })
  ]

  render() {
    return (
      <Table
        rowKey="Name"
        dataSource={this.state.data}
        columns={this.columns}
        pagination={false}
      />
    );
  }
}

export default App;