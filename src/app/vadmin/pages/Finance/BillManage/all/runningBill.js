import React, { Component } from 'react';
import moment from 'moment';
import Filter from './component/OrderAndBill/Filter';
import ExportModal from './component/OrderAndBill/ExportModal';
import Apis from '../../../../util/request';
import downloadCsv from '../../../../util/downloadCsv';
import { BillColumns, RunningOrderColumns } from './constant';
import DataTable from './component/OrderAndBill/DataTable';
import { Table } from 'antd';
import { withRouter } from 'react-router';
import { gerService } from '../../../../util';

const expenseConfig = window.INIT_CONFIG.expenseConfig;
let pageStatus = {};

@withRouter
class RunningBill extends Component {
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
    filterKey: 0,
    isBill: true,
    loading: true,
    hideZero: true,
  };
  orderParams = {};
  billParams = {};
  Limit = 10;
  expenseConfig = expenseConfig || {};
  services = (gerService('bill') || []).map(ele => {
    return ele.Name;
  });
  status = expenseConfig.OrderStatus || {};

  showExportModal = () => {
    this.setState({
      modalVisible: true
    });
  }

  handleExportOk = async (option = {}) => {
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
      Download: true,
    });
    this.handleExportCancel();
  }

  handleExportCancel = () => {
    this.setState({
      modalVisible: false
    });
  }

  getOrders = async (params) => {
    this.Order = '';
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

  getBills = async (params) => {
    let order = {};
    if (this.Order) {
      order.Orders = this.Order;
    }

    this.billParams = {
      ...params,
      ...order
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

  billApiCounter = 0
  getBillList = async (offset) => {
    pageStatus = {
      ...this.billParams,
    };
    if (!this.billParams.ProductGroups) {
      delete this.billParams.ProductGroups;
      this.billParams.Services = gerService('bill').map(service => service.Name).toString();
    } else {
      delete this.billParams.Services;
    }
    if (this.billParams.ServiceTree === '|') {
      this.billParams.ServiceTree = 'all';
    }
    this.billApiCounter = this.billApiCounter + 1;
    const counter = this.billApiCounter;
    let res = await Apis.ListBill({
      ...this.billParams,
      Offset: offset,
      Limit: this.Limit,
    });
    if (counter !== this.billApiCounter) {
      return;
    }
    this.setState({
      billList: res.BillMetadatas,
      loading: false,
      billData: {
        ...this.state.billData,
        total: res.Total
      }
    });
  }
  orderApiCounter = 0
  getOrderList = async (offset) => {
    pageStatus = {
      ...this.orderParams,
    };
    this.orderApiCounter = this.orderApiCounter + 1;
    const counter = this.orderApiCounter;
    let res = await Apis.ListOrder({
      ...this.orderParams,
      Offset: offset
    });
    if (counter !== this.orderApiCounter) {
      return;
    }
    this.setState({
      orderList: res.OrderMetadatas,
      loading: false,
      orderData: {
        ...this.state.orderData,
        total: res.Total
      }
    });
  }
  onOrderPageChange = (pageNum) => {
    this.setState({
      orderData: {
        ...this.state.orderData,
        current: pageNum,
      },
      loading: true
    });
    this.getOrderList((pageNum - 1) * this.Limit);
  }
  onBillPageChange = (pageNum) => {
    this.setState({
      billData: {
        ...this.state.billData,
        current: pageNum
      },
      loading: true
    });
    this.getBillList((pageNum - 1) * this.Limit);
  }
  hideZeroOrder = (e) => {
    this.setState({
      hideZero: e.target.checked
    });
  }
  orderFilter = (item) => {
    if (this.state.hideZero) {
      if (this.state.isBill) return true;
      return item.OrderAmount !== 0;
    }
    else {
      return true;
    }
  }

  getHashValueByKey = key => {
    function getHash(url) {
      return decodeURIComponent(url ? url.substring(url.indexOf('#') + 1) : window.location.hash.substr(1));
    }
    const hash = getHash(this.props.location.hash).split('&');
    const payStatusIndex = hash.findIndex(ele => ele.indexOf(key) === 0);
    return payStatusIndex !== -1 ? hash[payStatusIndex].split('=')[1] : '';
  }

  Order = ''

  getDataByOrders = order => {
    let params = {};
    if (order && order !== this.Order) {
      this.Order = order;
      params = {
        ...this.billParams,
      };
      this.getBills(params);
    }
  }

  render() {
    let payStatus = this.getHashValueByKey('payStatus');
    let customer = this.getHashValueByKey('customer');
    let productId = this.getHashValueByKey('productId');
    let serviceTree = this.getHashValueByKey('serviceTree');
    let beginTime = this.getHashValueByKey('beginTime');
    let endTime = this.getHashValueByKey('endTime');
    let serviceDefault = this.getHashValueByKey('service=');
    let name = this.getHashValueByKey('name');
    let ignoreZero = this.getHashValueByKey('ignoreZero');


    let payType = {};
    let payTypeTemp = this.getHashValueByKey('payType');
    if (payTypeTemp) {
      payType.payType = payTypeTemp;
    }
    productId = productId ? (productId + '').split(',') : [];
    if (serviceDefault) {
      productId = [];
      Object.keys(expenseConfig.ProductGroup).map((groupId) => {
        if (expenseConfig.ServiceOfProductGroup[groupId] === serviceDefault) {
          productId.push(groupId);
        }
      });
    }

    if (this.props.initData) {
      payStatus = '',customer = '',productId = '',serviceTree = '',beginTime = '',endTime = '';
      if (this.props.initData.time) {
        beginTime = moment(this.props.initData.time, 'YYYYMM').startOf('month').unix();
        endTime = moment(this.props.initData.time, 'YYYYMM').endOf('month').unix();
      }
      if (this.props.initData.productId) {
        productId = this.props.initData.productId;
      }
      if (this.props.initData.payStatus) {
        payStatus = this.props.initData.payStatus;
      }
      if (this.props.initData.payType) {
        payType.payType = this.props.initData.payType;
      }
      if (this.props.initData.serviceTree) {
        serviceTree = this.props.initData.serviceTree;
      }
      if (this.props.initData.customer) {
        customer = this.props.initData.customer;
      }
      if (this.props.initData.name) {
        name = this.props.initData.name;
      }
    }
    serviceTree = serviceTree === 'all' ? '' : serviceTree;

    let hashObj = {};
    hashObj.payType = pageStatus.PayType;
    hashObj.name = pageStatus.name;
    hashObj.ignoreZero = pageStatus.IgnoreZero;
    hashObj.serviceTree = pageStatus.ServiceTree === 'all' ? '' : pageStatus.ServiceTree;
    hashObj.productId = pageStatus.ProductGroups;
    hashObj.customer = pageStatus.Customer;
    hashObj.payStatus = pageStatus.Status;
    hashObj.beginTime = pageStatus._beginTime;
    hashObj.endTime = pageStatus._endTime;
    let hashStr = '';
    Object.keys(hashObj).forEach(key => {
      if (hashObj[key]) {
        hashStr = hashStr + '&' + key + '=' + hashObj[key];
      }
    });
    hashStr = '#' + hashStr.slice(1,hashStr.length);

    return (
      <div>
        <Filter
          {...payType}
          ignoreZero={ignoreZero}
          name={name}
          customer={customer}
          beginTime={beginTime}
          endTime={endTime}
          payStatus={payStatus}
          serviceTree={serviceTree}
          services={this.services}
          productId={productId}
          filterSearch={this.state.filterSearch}
          key={this.state.filterKey}
          status={expenseConfig.BillStatus}
          showModal={this.showExportModal}
          getPosts={this.getBills}
          getPres={this.getOrders}
          hideZeroOrder={this.hideZeroOrder}
          showHideTip
          showHideTipBill
          showAccountInput={false}
          isBill={this.state.isBill}
        ></Filter>
        <ExportModal
          handleOk={this.handleExportOk}
          handleCancel={this.handleExportCancel}
          visible={this.state.modalVisible}
          statusForPost={expenseConfig.BillStatus}
          statusForPre={expenseConfig.OrderStatus}
        ></ExportModal>
        {
          this.state.isBill ? (
            <Table
              className="content-box"
              dataSource={this.state.billList.filter(this.orderFilter)}
              columns={BillColumns(this.getDataByOrders, this.getHashValueByKey('service='), hashStr)}
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
              className="content-box"
              dataSource={this.state.orderList.filter(this.orderFilter)}
              columns={RunningOrderColumns}
              rowKey={'Id'}
              Limit={this.Limit}
              current={this.state.orderData.current}
              onChange={this.onOrderPageChange}
              loading={this.state.loading}
              {...this.state.orderData}
            ></DataTable>
          )
        }
      </div>
    );
  }
}

export default RunningBill;