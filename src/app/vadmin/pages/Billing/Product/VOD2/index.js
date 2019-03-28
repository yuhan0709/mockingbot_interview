import React, { Component } from 'react';
import { Table, Divider } from 'antd';
import { colFormat } from '@util/index';
import Apis from '../../../../util/request';
import Link from '@component/Link';
import moment from 'moment';

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentDidMount = async () => {
    this.getData({ Service: 'vod' });
  }
  getData = async (query) => {
    query = {
      ...this.state.query,
      ...query,
      Limit: 999
    };
    const data = await Apis.ListCommonProductGroup(query);
    let ProductGroupMetadatas = [];
    data.ProductGroupMetadatas.forEach(pgm => {
      if (pgm.Id === 'vod') {
        ProductGroupMetadatas.push(pgm);
      }
    });
    data.ProductGroupMetadatas = ProductGroupMetadatas;
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
        <span>
          <Link to={`./common/${rowData.Id}/`}>进入普通商品</Link>
          <Divider type="vertical" />
          <Link to={`./special/${rowData.Id}/`}>进入特殊定价</Link>
        </span>
      );
    })
  ]

  onChange = (current, size) => {
    const Limit = size;
    const Offset = (current - 1) * size;
    this.getData({ Limit,Offset });
  }

  render() {
    // const pagination = {
    //   showQuickJumper: true,
    //   current: Math.floor(this.state.data.Offset / this.state.data.Limit) + 1,
    //   pageSize: this.state.data.Limit,
    //   total: this.state.data.Total,
    //   onChange: this.onChange
    // };
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