import React, { Component } from 'react';
import Filter from '../common/Filter';
import Apis from '../../../util/request';
import moment from 'moment';
import DataTable from '../common/DataTable';
import Link from '@component/Link';
import ExportModal from '../common/ExportModal';
import downloadCsv from '../../../util/downloadCsv';
import { withRouter } from 'react-router';

@withRouter
class OrderManage extends Component {
  state = {
    modalVisible: false,
    orderList: [],
    orderData: {
      current: 1,
      total: 20
    },
    isPost: true,
    loading: true
  };
  orderParams = {
    payType: 'post'
  };
  Limit = 10;
  expenseConfig = window.INIT_CONFIG.expenseConfig || {};
  services = window.INIT_CONFIG.expenseConfig.Service || {};
  status = window.INIT_CONFIG.expenseConfig.OrderStatus || {};
  BillStatus = window.INIT_CONFIG.expenseConfig.BillStatus || {};
  OrderStatus = window.INIT_CONFIG.expenseConfig.OrderStatus || {};

  PostOrderColumns = [{
    title: '用户名',
    dataIndex: 'Identity',
    key: 'Identity',
  }, {
    title: '订单号',
    dataIndex: 'Id',
    key: 'Id'
  }, {
    title: '产品名称',
    dataIndex: 'Service',
    key: 'Service',
    render: (item) => {
      return this.services[item];
    }
  }, {
    title: '订单类型',
    dataIndex: 'OrderType',
    key: 'OrderType',
    render: (item) => {
      return this.expenseConfig.OrderType[item];
    }
  },{
    title: '下单时间',
    dataIndex: 'CreateTime',
    key: 'CreateTime',
    render: (time) => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')
  }, {
    title: '开通时间',
    dataIndex: 'BeginTime',
    key: 'BeginTime',
    render: (time) => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')
  }, {
    title: '支付状态',
    dataIndex: 'Status',
    key: 'Status',
    render: (item) => {
      return this.expenseConfig.OrderStatus[item];
    }
  }, {
    title: '操作',
    render: (item) => {
      return <Link to={`./${item.Id}/`}>详情</Link>;
    }
  }];
  PreOrderColumns = [{
    title: '用户名',
    dataIndex: 'Identity',
    key: 'Identity',
  }, {
    title: '订单号',
    dataIndex: 'Id',
    key: 'Id'
  }, {
    title: '产品名称',
    dataIndex: 'Service',
    key: 'Service',
    render: (item) => {
      return this.expenseConfig.Service[item];
    }
  }, {
    title: '订单类型',
    dataIndex: 'OrderType',
    key: 'OrderType',
    render: (item) => {
      return this.expenseConfig.OrderType[item];
    }
  }, {
    title: '下单时间',
    dataIndex: 'CreateTime',
    key: 'CreateTime',
    render: (time) => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')
  }, {
    title: '付款时间',
    dataIndex: 'PayTime',
    key: 'PayTime',
    render: (time) => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')
  }, {
    title: '支付状态',
    dataIndex: 'Status',
    key: 'Status',
    render: (item) => {
      return this.expenseConfig.OrderStatus[item];
    }
  }, {
    title: '应付金额',
    dataIndex: 'OrderAmount',
    key: 'OrderAmount',
    render: (val) => {
      return '¥' + (+val).toFixed(2);
    }
  }, {
    title: '操作',
    render: (item) => {
      return <Link to={`./${item.Id}/`}>详情</Link>;
    }
  }];

  showExportModal = () => {
    this.setState({
      modalVisible: true
    });
  }
  handleExportOk = async(option) => {
    const {
      BeginTime,
      EndTime,
    } = option;
    const Services = this.props.match.params.serviceName;
    let beginMonth = '',
      endMonth = '';
    if (BeginTime) {
      beginMonth = moment(BeginTime).format('YYYY-MM-DD') + '_';
    }
    if (EndTime) {
      endMonth = moment(EndTime).format('YYYY-MM-DD') + '_';
    }
    downloadCsv(`${Services}_${beginMonth}${endMonth}resource_order.csv`, 'ListOrder', {
      ...option,
      Download: true,
    });
    this.handleExportCancel();
  }
  handleExportCancel= () => {
    this.setState({
      modalVisible: false
    });
  }
  componentDidMount() {
    console.log(window.INIT_CONFIG);
    this.getOrderList(0);
  }
  hideZeroOrder(e) {
    console.log('checked', e.target.checked);
  }
  getOrders = async (params) => {
    console.log('params',params);
    this.orderParams = {
      ...params,
    };
    this.setState({
      isPost: params.PayType === 'post',
      loading: true,
      orderData: {
        ...this.state.orderData,
        current: 1
      },
    });
    this.getOrderList(0);
  }
  getAccountIds = async QueryName => {
    if (!QueryName) {
      return {};
    }
    const AccountIds = [];
    const data = await Apis.QueryAccountV2({
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
  getOrderList = async (offset) => {
    const params = await this.getAccountIds(this.orderParams.AccountIds);
    let res = await Apis.ListOrder({
      ...this.orderParams,
      Services: this.props.match.params.serviceName,
      Offset: offset,
      ...params,
    });
    this.setState({
      orderList: res.OrderMetadatas,
      loading: false,
      orderData: {
        ...this.state.orderData,
        total: res.Total,
      },
    });
  }
  onOrderPageChange  = (pageNum) => {
    console.log('handleChange', pageNum);
    this.setState({
      orderData: {
        ...this.state.orderData,
        current: pageNum,
      },
      loading: true
    });
    this.getOrderList((pageNum - 1) * this.Limit);
  }

  render() {
    return (
      <div>
        <Filter
          services={this.services}
          status={this.status}
          showModal={this.showExportModal}
          hideZeroOrder={this.hideZeroOrder}
          getPosts={this.getOrders}
          getPres={this.getOrders}
          showPayType={true}
        />
        <ExportModal
          handleOk={this.handleExportOk}
          handleCancel={this.handleExportCancel}
          visible={this.state.modalVisible}
          statusForPost={this.BillStatus}
          statusForPre={this.OrderStatus}
        />
        {
          this.state.isPost ?
            (
              <DataTable
                dataSource={this.state.orderList}
                columns={this.PostOrderColumns}
                rowKey={'Id'}
                Limit={this.Limit}
                onChange={this.onOrderPageChange}
                loading={this.state.loading}
                {...this.state.orderData}
              />
            ) : (
              <DataTable
                dataSource={this.state.orderList}
                columns={this.PreOrderColumns}
                rowKey={'Id'}
                Limit={this.Limit}
                {...this.state.orderData}
                onChange={this.onOrderPageChange}
                loading={this.state.loading}
              />)
        }

      </div>
    );
  }
}

export default OrderManage;