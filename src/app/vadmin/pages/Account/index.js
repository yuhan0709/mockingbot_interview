import React, { Component } from 'react';
import { Input } from 'antd';
import Table from './table';
import Apis from '../../util/request';

const Search = Input.Search;

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: {},
      refresh: {},
      data: {},
      serviceKey: [],
      queryValue: ''
    };

  }

  async componentDidMount() {
    await this.getData();

    Apis.GetServiceMap().then(res => {
      const serviceKey = res.List.map(ele => {
        return ele.TagKey;
      });
      this.setState({
        serviceKey
      });
    });
  }
// 交互获取到table数据。
  getData = async (query = {}) => {
    query = {
      ...this.state.query,
      ...query,
    };
    if (!query.Services){
      delete query.Services;
    }
    const data = await Apis.QueryAccount(query);
    data.List.forEach(ele => {
      ele.key = ele.Id;
    });
    this.setState({
      data,
      query: {
        Services: query.Services,
        Query: query.Query
      },
      refresh: query
    });
  }

  refresh = () => {
    this.getData(this.state.refresh);
  }

  change = event => {
    let val = event.target.value.trim();
    this.setState({
      queryValue: val
    });
    this.getData({ Query: val });
  }

  render() {
    return (
      <div>
        <Search
          placeholder="请输入用户ID/用户名/邮箱进行模糊搜索"
          onChange={this.change}
          value = {this.state.queryValue}
          style={{ display: 'block',width: 400,margin: 'auto 0px 20px auto' }}
        />
        <Table
          data={this.state.data}
          getData={this.getData}
          serviceKey={this.state.serviceKey}
          refresh={this.refresh}
        />
      </div>
    );
  }
}

export default Account;