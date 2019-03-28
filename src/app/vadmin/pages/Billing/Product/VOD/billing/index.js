import React, { Component } from 'react';
import { Table } from 'antd';
import Apis from '../../../../../util/request';
import moment from 'moment';

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        BillingMethodTemplates: [],
      },
      loading: true
    };
    this.expenseConfig = window.INIT_CONFIG.expenseConfig || {};
  }

  componentDidMount() {
    this.getData();
  }

  getData = async (query) => { // query = { Limit: 5,Offset: 0 }
    const data = await Apis.ListBillingMethodTemplates({
      ...query
    });
    this.setState({
      data,
      loading: false
    });
  }

  columns = [
    colFormat('Category', 'Category', (item) => {
      return this.expenseConfig.BillingMethodCategory[item];
    }),
    colFormat('计费类型', 'SubCategory', (item) => {
      return this.expenseConfig.BillingMethodSubCategory[item] || '';
    }),
    colFormat('CTID', 'Id'),
    colFormat('计费法', 'Name'),
    colFormat('计量周期', 'MetrologyPeriod', (item) => {
      return this.expenseConfig.Period[item];
    }),
    colFormat('结算周期', 'SettlementPeriod', (item) => {
      return this.expenseConfig.Period[item];
    }),
    colFormat('梯度', 'BillingMethodInterval', (item) => {
      let Interval = item.Interval;
      if (!Interval || Interval.length != 1 ){
        return 0;
      }
      Interval = Interval[0].Interval;
      let res = [];
      Interval.forEach((item, index) => {
        if (index != Interval.length - 1) {
          res.push(item.Lt);
        }
      });
      return res.join(',');
    }),
    colFormat('最后修改时间', 'UpdateTime', (time) => moment.unix(time).format('YYYY-MM-DD HH:mm:ss'))
  ]

  onChange = (current, size) => { //current, size
    const Limit = size;
    const Offset = (current - 1) * size;
    this.getData({ Limit,Offset });
  }

  render() {
    const pagination = {
      showQuickJumper: true,
      current: Math.floor(this.state.data.Offset / this.state.data.Limit) + 1,
      pageSize: this.state.data.Limit,
      total: this.state.data.Total,
      onChange: this.onChange,
      showTotal: () => `共有 ${this.state.data.Total} 条数据，每页显示 ${this.state.data.Limit} 条`
    };
    return (
      <div>
        <Table
          dataSource={this.state.data.BillingMethodTemplates}
          columns={this.columns}
          pagination={pagination}
          loading={this.state.loading}
          rowKey={'Id'}
        />
      </div>
    );
  }
}

function colFormat(title, key, render) {
  const res = {
    title: title,
    dataIndex: key,
    key: key,
  };
  if (render) {
    res['render'] = render;
  }
  return res;
}
export default Product;