import React, { Component } from 'react';
import { Table, Button, DatePicker, Input } from 'antd';
import { colFormat } from '@util/index';
import Navigate from '@util/navigate';
import Apis from '../../../../../util/request';
import Link from '@component/Link';
import moment from 'moment';
import { withRouter } from 'react-router';

const { RangePicker } = DatePicker;

@withRouter
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      modalStatus: 'create',
      modalVisible: true
    };
  }

  param = {
  };

  searchUser = (e) => {
    const value = e.target.value;
    this.param.AccountIds = value;
  }

  search = () => {
    this.getData(this.param);
  }

  componentDidMount = async () => {
    this.getData({ ProductGroupId: this.props.match.params.ID });
  }

  getData = async (query) => {
    query = {
      ...this.state.query,
      ...query,
    };
    const data = await Apis.ListSpecialProductGroup(query);
    this.setState({
      query,
      data
    });
    return data;
  }

  columns = [
    colFormat('用户ID', 'AccountId'),
    colFormat('创建时间', 'CreateTime', time => {
      return  moment.unix(time).format('YYYY-MM-DD HH:mm:ss');
    }),
    colFormat('是否过期', 'expiry', expiry => {
      return expiry ? '是' : '否';
    }),
    colFormat('操作', 'chosen', (_, rowData) => {
      return (
        <Link to={`./${rowData.AccountId}/`}>特殊商品管理</Link>
      ); })
  ]

  onChange = (current, size) => {
    const Limit = size;
    const Offset = (current - 1) * size;
    this.getData({ Limit,Offset });
  }

  timeChange = data => {
    this.param.BeginTime = '';
    this.param.EndTime = '';
    if (data.length === 2) {
      this.param = {
        ...this.param,
        BeginTime: data[0].toISOString(),
        EndTime: data[1].toISOString()
      };
    }
  }

  render() {
    const pagination = {
      showQuickJumper: true,
      current: Math.floor(this.state.data.Offset / this.state.data.Limit) + 1,
      pageSize: this.state.data.Limit,
      total: this.state.data.Total,
      onChange: this.onChange
    };
    return (
      <div>
        <Button type="primary"
          style={{ marginRight: '20px' }}
          onClick={() => {
            Navigate.go('./add/');
          }}
        >
          添加
        </Button>
        <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.timeChange}/>
        <span>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <span className="common-box">用户ID:</span>
          <Input
            className="common-box"
            placeholder="请输入用户ID进行搜索"
            onChange={this.searchUser}
            style={{ width: 200 }}
          />
        </span>
        <Button type="primary" className="common-box" onClick={this.search}>
          查询
        </Button>
        <Table
          rowKey="AccountId"
          dataSource={this.state.data.ProductGroupMetadatas}
          columns={this.columns}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default Product;