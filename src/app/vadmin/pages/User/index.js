import React, { Component } from 'react';
import { Input, message } from 'antd';
import Table from './table';
import Apis from '../../util/request';
import superLogin from '../../../../server/api/passport/superLogin';

const Search = Input.Search;
const { account: accountPermission = {} } = window.INIT_CONFIG.permission;
const { super: superPermission = [] } = accountPermission;
const isBigSuper = superPermission.some(action => action === 'r') && superPermission.some(action => action === 'w');
function judgeSuper(Id) {
  return isBigSuper || superPermission.some(action => +action === +Id);
}
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

  getData = async (query = {}) => {
    query = {
      QueryName: this.state.queryValue,
      WithTag: true,
      ...this.state.query,
      ...query,

    };
    if (!query.Services) {
      delete query.Services;
    }
    const data = await Apis.QueryAccountV2(query);
    data.List.forEach(ele => {
      ele.key = ele.Id;
    });
    console.log(data);
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
    this.getData({ QueryName: val });
  }
  assumeAccount = async ({ Identity, Id }) => {
    const res = await superLogin({ Identity, Id });
    if (res.status === 'success') {
      window.open(res.url);
    } else {
      message.error(res.message);
    }
  }
  render() {
    return (
      <div>
        <Search
          placeholder="请输入用户ID/用户名/邮箱进行模糊搜索"
          onChange={this.change}
          value={this.state.queryValue}
          style={{ display: 'block', width: 400, margin: 'auto 0px 20px auto' }}
        />
        <Table
          data={this.state.data}
          getData={this.getData}
          serviceKey={this.state.serviceKey}
          refresh={this.refresh}
          judgeSuper={judgeSuper}
          assumeAccount={this.assumeAccount}
        />
      </div>
    );
  }
}

export default Account;