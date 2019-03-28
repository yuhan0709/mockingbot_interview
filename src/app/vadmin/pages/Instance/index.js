import React, { Component } from 'react';
import Table from './table';
import Header from './header';
import Request from '../../util/request';
// import { getExpenseConfig } from '../../util';
import { message } from 'antd';
import { withRouter } from 'react-router';

const {
  QueryAccountV2,
  ListInstance,
  ListOrder,
  UpgradePostInstance: UpgradeInstance,
  TrialPostInstance: TrialInstance
} = Request;

const defaultParam = {
  Limit: 20,
  Offset: 0
};

@withRouter
class Instance extends Component {
  param = {}
  constructor(props) {
    super(props);
    this.state = {
      instances: {}
    };
  }

  async componentDidMount() {
    await this.checkPage();
  }

  getAccountIds = async QueryName => {
    if (!QueryName) {
      return {};
    }
    const AccountIds = [];
    const data = await QueryAccountV2({
      QueryName,
      Limit: 999
    });
    data.List.forEach(user => {
      AccountIds.push(user.Id);
    });
    return {
      AccountIds: AccountIds + ''
    };
  }

  checkPage = async (params = defaultParam) => {
    const AccountIdParams = await this.getAccountIds(this.param.AccountIds);
    const instances = await ListInstance({
      ...this.param,
      ...params,
      ...AccountIdParams,
      Services: this.props.match.params.serviceName,
    });
    this.setState({
      instances
    });
  }

  search = (param) => {
    this.param = param;
    this.checkPage();
  }

  onPaginationChange = async ({ Limit, Offset }) => {
    console.log('change pagination', Limit, Offset);
    await this.checkPage({
      Limit,
      Offset
    });
  }

  edit = async (data = {}) => {
    // 如果 tabs 是更改计费法，把几个商品字段拿出来去查询 productId
    try {
      if (data.tab === '更改计费法') {
        const product = data.products.find(p => {
          const equals = Object.keys(p.Method)
            .every(key => data[key] === p.Method[key]);

          return equals;
        }) || {};
        if (!product.Id) {
          message.error('此商品不存在！');
          return;
        }
        await UpgradeInstance({ InstanceId: data.id,ProductId: product.Id,BeginTime: data.BeginTime.toISOString() });
        message.success('实例更配成功！');
      } else {
        await TrialInstance({ InstanceId: data.id,TestBeginTime: data.TimeRange[0].toISOString(),TestEndTime: data.TimeRange[1].toISOString() });
        message.success('实例试用配置成功！');
      }
    } catch (e) {
      message.error('实例配置失败！');
    }
  }

  getOrders = async (param) => {
    // console.log('获取订单数据', param);
    const orders = await ListOrder(param);
    this.setState({
      orders
    });
  }

  render() {
    return (
      <div>
        <Header onSearch={this.search}/>
        <Table
          rowKey='Id'
          dataSource={this.state.instances}
          onPaginationChange={this.onPaginationChange}
          onEdit={this.edit}
          onShowOrders={this.getOrders}
          orders={this.state.orders}
        />
      </div>
    );
  }
}

export default Instance;