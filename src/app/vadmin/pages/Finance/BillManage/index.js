import React, { Component } from 'react';
import Filter from '../common/Filter';
import Apis from '../../../util/request';
import moment from 'moment';
import { Table } from 'antd';
import DataTable from '../common/DataTable';
import ExportModal from '../common/ExportModal';
import Link from '@component/Link';
import downloadCsv from '../../../util/downloadCsv';
import { withRouter } from 'react-router';

@withRouter
class BillManage extends Component {
  state = {
    modalVisible: false,
    orderList: [],
    billList: [],
    billData: {
      current: 1,
      total: 20
    },
    orderData: {
      current: 1,
      total: 20
    },
    isBill: true,
    loading: true,
    hideZero: false
  };
  orderParams = {};
  billParams = {};
  Limit = 10;
  expenseConfig = window.INIT_CONFIG.expenseConfig || {};
  services = window.INIT_CONFIG.expenseConfig.Service || {};
  OrderStatus = window.INIT_CONFIG.expenseConfig.OrderStatus || {};
  BillStatus = window.INIT_CONFIG.expenseConfig.BillStatus || {};

  BillColumns = [{
    title: '用户名',
    dataIndex: 'Identity',
    key: 'Identity',
  }, {
    title: '账单号',
    dataIndex: 'Id',
    key: 'Id',
  }, {
    title: '发生时间',
    dataIndex: 'BeginTime',
    key: 'BeginTime',
    render: (_, rowData) => {
      const {
        BeginTime,
        EndTime,
      } = rowData;
      return <span>{moment.unix(BeginTime).format('YYYY-MM-DD HH:mm:ss')} ~<br />{moment.unix(EndTime).format('YYYY-MM-DD HH:mm:ss')}</span>;
    }
  }, {
    title: '产品名称',
    dataIndex: 'ProductGroupId',
    key: 'ProductGroupId',
    render: id => {
      return this.expenseConfig.ProductGroup[id] ? this.expenseConfig.ProductGroup[id] : id;
    }
  }, {
    title: '账单类型',
    dataIndex: 'BillType',
    key: 'BillType',
    render: (item) => {
      return this.expenseConfig.BillType[item];
    }
  }, {
    title: '账单金额',
    dataIndex: 'BillAmount',
    key: 'BillAmount',
    render: (val) => {
      return '¥' + (+val).toFixed(2);
    }
  }, {
    title: '应付金额',
    dataIndex: 'ShouldPayAmount',
    key: 'ShouldPayAmount',
    render: (val) => {
      return '¥' + (+val).toFixed(2);
    }
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
  OrderColumns = [{
    title: '用户名',
    dataIndex: 'Identity',
    key: 'Identity',
  }, {
    title: '消费时间',
    dataIndex: 'CreateTime',
    key: 'CreateTime',
    render: (time) => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')
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
  }, {
    title: '订单号',
    dataIndex: 'Id',
    key: 'Id',
  }, {
    title: '应付金额',
    dataIndex: 'OrderAmount',
    key: 'OrderAmount',
    render: (val) => {
      return '¥' + (+val).toFixed(2);
    }
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
  showExportModal = () => {
    this.setState({
      modalVisible: true
    });
  }
  handleExportOk = async(option = {}) => {
    const Func = option.PayType === 'post' ? 'ListBill' : 'ListOrder';
    const {
      BeginTime,
      EndTime,
      Services = 'all'
    } = option;
    let beginMonth = '',
      endMonth = '';
    const listType = option.PayType === 'post' ? 'bill' : 'order';
    if (BeginTime) {
      beginMonth = moment(BeginTime).format('YYYY-MM-DD') + '_';
    }
    if (EndTime) {
      endMonth = moment(EndTime).format('YYYY-MM-DD') + '_';
    }
    downloadCsv(`${Services}_${beginMonth}${endMonth}resource_${listType}.csv`, Func, {
      ...option,
      Services: this.props.match.params.serviceName,
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
    this.getBillList();
  }
  hideZeroOrder = (e) => {
    this.setState({
      hideZero: e.target.checked
    });
  }
  getOrders = async (params) => {
    this.orderParams = {
      ...params,
      Status: 1    //账单里面显示已支付的订单
    };
    this.setState({
      isBill: false,
      loading: true,
      orderData: {
        ...this.state.orderData,
        current: 1
      }
    });
    this.getOrderList(0);
  }
  getBills = async(params) => {
    console.log(params);

    this.billParams = {
      ...params
    };
    this.setState({
      isBill: true,
      loading: true,
      billData: {
        ...this.state.billData,
        current: 1
      }
    });
    this.getBillList(0);
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
  getBillList = async (offset) => {
    const params = await this.getAccountIds(this.billParams.AccountIds);
    let res = await Apis.ListBill({
      ...this.billParams,
      Services: this.props.match.params.serviceName,
      Offset: offset,
      Limit: this.Limit,
      ...params,
    });
    this.setState({
      billList: res.BillMetadatas,
      loading: false,
      billData: {
        ...this.state.billData,
        total: res.Total
      }
    });
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
        total: res.Total
      }
    });
  }
  onOrderPageChange  = (pageNum) => {
    this.setState({
      orderData: {
        ...this.state.orderData,
        current: pageNum,
      },
      loading: true
    });
    this.getOrderList((pageNum - 1) * this.Limit);
  }
  onBillPageChange  = (pageNum) => {
    this.setState({
      billData: {
        ...this.state.billData,
        current: pageNum
      },
      loading: true
    });
    this.getBillList((pageNum - 1) * this.Limit);
  }
  orderFilter = (item) => {
    if (this.state.hideZero) {
      return item.OrderAmount != 0;
    }
    else {
      return true;
    }
  }
  render() {
    return (
      <div>
        <Filter
          services={this.services}
          status={this.BillStatus}
          showModal={this.showExportModal}
          hideZeroOrder={this.hideZeroOrder}
          getPosts={this.getBills}
          getPres={this.getOrders}
          showHideTip={true}
        />
        <ExportModal
          handleOk={this.handleExportOk}
          handleCancel={this.handleExportCancel}
          visible={this.state.modalVisible}
          statusForPost={this.BillStatus}
          statusForPre={this.OrderStatus}
        />
        {
          this.state.isBill ? (
            <Table
              dataSource={this.state.billList}
              columns={this.BillColumns}
              rowKey={'Id'}
              Limit={this.Limit}
              loading={this.state.loading}
              pagination={{
                showQuickJumper: true,
                showSizeChanger: true,
                onShowSizeChange: (_, pageSize) => {
                  this.Limit = pageSize;
                  this.onBillPageChange(1);
                },
                pageSizeOptions: ['10', '20', '50', '100'],
                current: this.state.billData.current,
                pageSize: this.Limit,
                total: this.state.billData.total,
                onChange: this.onBillPageChange,
                showTotal: () => `共有 ${this.state.billData.total} 条数据，每页显示 ${this.Limit} 条`
              }}
            />
          ) : (
            <DataTable
              dataSource={this.state.orderList.filter(this.orderFilter)}
              columns={this.OrderColumns}
              rowKey={'Id'}
              Limit={this.Limit}
              current={this.state.orderData.current}
              onChange={this.onOrderPageChange}
              loading={this.state.loading}
              {...this.state.orderData}
            />
          )
        }
      </div>
    );
  }
}

export default BillManage;