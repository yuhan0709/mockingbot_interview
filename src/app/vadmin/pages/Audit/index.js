import React, { Component } from 'react';
import { Table } from 'antd';
import { colFormat } from '@util/index';
import Link from '@component/Link';

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: Object.keys(window.INIT_CONFIG.expenseConfig.Service).map(key => ({ Name: key }))
    };
  }

  columns = [
    colFormat('服务名称', 'Name'),
    colFormat('产品名称', 'ProductName', (_, rowData) => {
      return window.INIT_CONFIG.expenseConfig.Service[rowData.Name];
    }),
    colFormat('操作', 'chosen', (_, rowData) => {
      return (
        <Link to={`./${rowData.Name}/`}>
            审核管理
        </Link>
      ); })
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

export default Product;