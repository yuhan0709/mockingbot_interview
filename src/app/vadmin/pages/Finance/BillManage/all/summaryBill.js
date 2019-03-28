import React, { Component } from 'react';
import moment from 'moment';
import Filter from './component/OrderAndBill/Filter';
import ExportModal from './component/OrderAndBill/ExportModal';
import Apis from '../../../../util/request';
import DataTable from './component/OrderAndBill/DataTable';
import downloadCsv from '../../../../util/downloadCsv';
import { BillSummaryColumns, OrderSummaryColumns } from './constant';
import { Table } from 'antd';
import { withRouter } from 'react-router';
import { gerService } from '../../../../util';



const expenseConfig = window.INIT_CONFIG.expenseConfig;
@withRouter
class SummaryBill extends Component {
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
    loading: true
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
    const Func = option.PayType === 'post' ? 'GroupBill' : 'SummaryOrder';
    const {
      BeginTime,
      EndTime,
      Services = 'all'
    } = option;
    let beginMonth = '',
      endMonth = '';
    const listType = option.PayType === 'post' ? 'bill' : 'order';
    if (BeginTime) {
      beginMonth = moment(BeginTime).format('YYYY-MM') + '_';
    }
    if (EndTime) {
      endMonth = moment(EndTime).format('YYYY-MM') + '_';
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
    this.orderParams = {
      ...params,
      Status: 1    //账单里面显示已支付的订单
    };
    this.setState({
      payStatus: params.Status,
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
    this.billParams = {
      ...params
    };
    this.setState({
      payStatus: params.Status,
      isBill: true,
      loading: true,
      billData: {
        ...this.state.billData,
        current: 1
      }
    });
    this.getBillList(0);
  }

  serviceTree = ''
  billApiCounter = 0
  getBillList = async offset => {
    let params = {  ...this.billParams };
    if (!params.ProductGroups) {
      delete params.ProductGroups;
      params.Services = gerService('bill').map(service => service.Name).toString();
    } else {
      delete params.Services;
    }
    if (params.ServiceTree === '|') {
      params.ServiceTree = 'all';
    }
    this.customer = params.Customer;
    this.serviceTree = params.ServiceTree;
    this.billApiCounter = this.billApiCounter + 1;
    const counter = this.billApiCounter;
    let res = await Apis.GroupBill({
      PayType: 'post',
      ...params,
      Offset: offset ,
      Limit: this.Limit,
    });
    if (counter !== this.billApiCounter) {
      return;
    }
    this.setState({
      billList: res.List,
      loading: false,
      billData: {
        ...this.state.billData,
        total: res.Total
      }
    });
  }

  orderApiCounter = 0
  getOrderList = async (offset) => {
    delete this.orderParams.Status;
    delete this.orderParams.PayType;
    this.orderParams.PayType;
    if (this.orderParams.ServiceTree === '|') {
      this.orderParams.ServiceTree = 'all';
    }
    this.serviceTree =  this.orderParams.ServiceTree;
    this.customer = this.orderParams.Customer;
    this.orderApiCounter = this.orderApiCounter + 1;
    const counter = this.orderApiCounter;
    let res = await Apis.SummaryOrder({
      ...this.orderParams,
      Offset: offset,
    });
    if (counter !== this.orderApiCounter) {
      return;
    }
    this.setState({
      orderList: res.List,
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
    const params = {};
    if (order && order !== this.Order) {
      this.Order = order;
      params.Orders = order;
      this.getBills(params);
    }
  }

  render() {
    const payStatus = this.getHashValueByKey('payStatus');
    const customer = this.getHashValueByKey('customer');
    let productId = this.getHashValueByKey('productId');
    const serviceTree = this.getHashValueByKey('serviceTree');
    const beginTime = this.getHashValueByKey('beginTime');
    const endTime = this.getHashValueByKey('endTime');
    const serviceDefault = this.getHashValueByKey('service=');
    if (serviceDefault) {
      productId = [];
      Object.keys(expenseConfig.ProductGroup).map((groupId) => {
        if (expenseConfig.ServiceOfProductGroup[groupId] === serviceDefault) {
          productId.push(groupId);
        }
      });
    }
    return (
      <div>
        <Filter
          customer={customer}
          beginTime={beginTime}
          endTime={endTime}
          payStatus={payStatus}
          productId={productId}
          serviceTree={serviceTree}
          services={this.services}
          status={expenseConfig.BillStatus}
          showModal={this.showExportModal}
          getPosts={this.getBills}
          getPres={this.getOrders}
          showHideTip={false}
          showAccountInput={false}
          isBill={this.state.isBill}
          monthMode
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
              dataSource={this.state.billList}
              columns={BillSummaryColumns(data => {
                this.props.toRunningBill({ ...data, payStatus: this.state.payStatus, serviceTree: this.serviceTree, customer: this.customer });
              }, this.getDataByOrders)}
              rowKey={'Id'}
              Limit={this.Limit}
              className="content-box"
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
              dataSource={this.state.orderList}
              columns={OrderSummaryColumns(data => {
                this.props.toRunningBill({ ...data, payStatus: this.state.payStatus, serviceTree: this.serviceTree, customer: this.customer });
              })}
              rowKey={'Id'}
              Limit={this.Limit}
              className="content-box"
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

export default SummaryBill;