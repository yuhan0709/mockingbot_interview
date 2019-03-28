import React, { Component } from 'react';
import { Table } from 'antd';
import { colFormat } from '@util/index';
import Apis from '../../../../util/request';
import Link from '@component/Link';
import { withRouter } from 'react-router';
import moment from 'moment';

@withRouter
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentDidMount = async () => {
    this.getData({ Service: this.props.match.params.service });
  }

  getData = async (query) => {
    query = {
      ...this.state.query,
      ...query,
      Limit: 999
    };
    const data = await Apis.ListCommonProductGroup(query);
    this.setState({
      query,
      data
    });
    return data;
  }

  columns = [
    colFormat('商品组ID', 'Id'),
    colFormat('商品组名称', 'ProductName'),
    colFormat('计费方式', 'PayType', type => {
      return window.INIT_CONFIG.expenseConfig.PayType[type];
    }),
    colFormat('更新时间', 'UpdateTime', time => {
      return  moment.unix(time).format('YYYY-MM-DD HH:mm:ss');
    }),
    colFormat('操作', 'chosen', (_, rowData) => {
      return (
        <Link to={`./common/${rowData.Id}/`}>商品管理</Link>
      );
    })
  ]

  onChange = (current, size) => {
    const Limit = size;
    const Offset = (current - 1) * size;
    this.getData({ Limit,Offset });
  }

  render() {
    return (
      <Table
        rowKey="Id"
        dataSource={this.state.data.ProductGroupMetadatas}
        columns={this.columns}
        pagination={false}
      />
    );
  }
}

export default Product;