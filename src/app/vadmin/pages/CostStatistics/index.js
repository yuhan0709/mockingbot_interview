import React, { Component } from 'react';
import { Table } from 'antd';
import Link from '@component/Link';
import Request from '../../util/request';

const { GetCost } = Request;
class Cost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: []
    };
  }

  async componentDidMount() {
    const keys = ['vod','live'].filter(key=>{
      const permission = window.INIT_CONFIG.permission;
      return permission.public.developer || permission.expense.admin || permission['expense'][`cost_${key}`];
    });
    const { List } = await GetCost({
      keys
    });
    this.setState({
      list: List
    });
  }

  render() {
    const columns = [{
      title: '服务名称',
      dataIndex: 'name',
      key: 'name',
    },{
      title: '操作',
      key: 'Op',
      render: (_, rowData) => {
        return <Link
          to={`/app/billing/cost/${rowData.key}`}>
          进入管理
        </Link>;
      }
    }];
    return (
      <div>
        <Table
          rowKey="key"
          columns={columns}
          dataSource={this.state.list}
          pagination={false}
        />
      </div>
    );
  }
}

export default Cost;