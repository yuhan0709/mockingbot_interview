import React from 'react';
import Apis from '../../../util/request';
import { withRouter } from 'react-router';
import moment from 'moment';
import DetailPage from '../../../component/DetailPage';
import { ecsHeaderRows, headerTitle, tableTitle, detailHeaderRows, getDetailTable } from './config';
@withRouter
export default class OrderDetail extends React.Component {
  state = {
    order: {},
    headerConfig: {},
    tableConfig: {},
  }
  componentDidMount() {
    this.getConfig();
  }
  getConfig = async () => {
    this.config = window.INIT_CONFIG.expenseConfig;
    this.getOrder();
  }
  getOrder = async () => {
    if (this.props.match.params && this.props.match.params.orderId) {
      const res = await Apis.GetOrderWithRegion({ OrderId: this.props.match.params.orderId });
      if (res.Order) {
        const order = res.Order;
        const rows = await this.getDetailRows(order);
        const tables = this.getDetailTables(order);
        this.setState({
          order: res.Order,
          headerConfig: {
            rows,
            title: headerTitle,
          },
          tableConfig: {
            tables,
            title: tableTitle
          },
          dataReady: true,
        });
      }
    }
  }
  getDetailRows = async(data) => {
    const {
      OrderType = {},
      OrderStatus = {},
    } = this.config;
    const rows = [...(data.Service !== 'ecs' ? detailHeaderRows : ecsHeaderRows)];
    rows[0][0].value.content = data.Id;
    rows[1][0].value.content = moment.unix(data.CreateTime).format('YYYY-MM-DD HH:mm:ss');
    rows[2][0].value.content = OrderType[data.OrderType] || data.OrderType;
    rows[2][1].value.content = OrderStatus[data.Status] || data.Status;
    return rows;
  }
  getDetailTables = (data) => {
    const {
      BillingMethodName = {},
      BillingMethodCategory = {},
      PayType = {},
      ProductGroup
    } = this.config;
    const billMethods = [];
    const tables = [];
    if (data && data.ProductMetadata && data.ProductMetadata.BillingMethodCombination) {
      const BillingMethodCombination = data.ProductMetadata.BillingMethodCombination;
      if (data.Service === 'ecs') {
        tables.push(getDetailTable(data.Service));
        data.PayTypeCN = PayType[data.PayType] || data.PayType;
        tables[0].dataSource = [data];
      } else if (data.Service === 'live') {
        BillingMethodCombination.forEach((method) => {
          let methodValueName  = '';
          //目前cdn服务的处理方式不同
          if (method.Key === 'CDN') {
            methodValueName = method.Value.map(subMethod => {
              return <div key={subMethod.DisplayName}>
                {`${subMethod.DisplayName} —— ${subMethod.Func ? this.config.billingMap.live[subMethod.Func.FuncName] : ''}`}
              </div>;
            });
          } else {
            const methodValue = method.Value[0];
            if (methodValue.Func) {
              methodValueName = this.config.billingMap.live[methodValue.Func.FuncName];
            } else if (methodValue.Value) {
              methodValueName = this.config.billingMap.live[methodValue.Value[0].Func.FuncName];
            }
          }
          billMethods.push({
            category: method.DisplayName,
            method: methodValueName
          });
        });
        tables.push(getDetailTable(BillingMethodCombination[0].Category));
        tables[0].dataSource = billMethods;
      } else {
        BillingMethodCombination.forEach((BillingCategory) => {
          if (BillingCategory.BillingMethod) {
            const methodId = BillingCategory.BillingMethod.Id;
            const category = BillingCategory.Category;
            billMethods.push({
              category: BillingMethodCategory[data.Service] && BillingMethodCategory[data.Service][category]
                ? BillingMethodCategory[data.Service][category]
                : (ProductGroup[BillingCategory.SubCategory] || category),
              method: BillingMethodName[methodId] || methodId
            });
          } else if (BillingCategory.Key) {
            const method = BillingCategory.Value.DisplayName
              ? BillingCategory.Value.DisplayName
              : BillingCategory.Value.map(subMethod => <div key={subMethod.DisplayName}>{`${subMethod.DisplayName}-${subMethod.Value.DisplayName}`}</div>);
            billMethods.push({
              category: BillingCategory.DisplayName,
              method
            });
          }
        });
        tables.push(getDetailTable(BillingMethodCombination[0].Category));
        tables[0].dataSource = billMethods;
      }
    }
    return tables;
  }
  render() {
    return (
      <DetailPage
        barTitle={`订单号: ${this.state.order.Id}`}
        headerConfig={this.state.headerConfig}
        tableConfig={this.state.tableConfig}
        dataReady={this.state.dataReady}
      />);
  }
}