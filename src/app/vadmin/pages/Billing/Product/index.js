import React, { Component } from 'react';
import { Table } from 'antd';
import { colFormat } from '@util/index';
import Link from '@component/Link';
import { gerService } from '../../../util';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: gerService('product')
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
      if (rowData.Name === 'vod') {
        rowData.Name = 'vod2';
      }
      const commenService = window.INIT_CONFIG.expenseConfig.CommonService[rowData.Name];
      if (commenService) {
        return (
          <Link to={`./common/${rowData.Name}/`} disabled={commenService.status === 'offline'}>商品组管理</Link>
        );
      }
      if (Object.keys(window.INIT_CONFIG.expenseConfig.DigitalCommonService).findIndex(service => rowData.Name === service) !== -1) {
        return (
          <Link to={`./digital/${rowData.Name}/`}>商品组管理</Link>
        );
      }
      return (
        <Link to={`./${rowData.Name}/`}>商品组管理</Link>
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