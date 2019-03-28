import React from 'react';
import Apis from '../../../util/request';
import { withRouter } from 'react-router';
import DetailPage from '../../../component/DetailPage';
import { getTable, headerTitle, tableTitle, detailHeaderRows, getTimeRangeString } from './config';
import { message } from 'antd';

@withRouter
export default class OrderDetail extends React.Component {
  state = {
    bill: {},
    headerConfig: {},
    tableConfig: {},
    dataReady: false,
  }

  componentDidMount() {
    this.getConfig();
  }

  getConfig = async () => {
    this.config = window.INIT_CONFIG.expenseConfig;
    this.getBill();
  }

  getBill = async () => {
    if (this.props.match.params && this.props.match.params.billId) {
      const res = await Apis.GetBillWithRegion({ BillId: this.props.match.params.billId });
      if (res.Bill) {
        const bill = res.Bill;
        const rows = this.getDetailRows(bill);
        const tables = this.getDetailTables(bill);
        this.setState({
          bill: res.Bill,
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

  getHashValueByKey = key => {
    function getHash(url) {
      return decodeURIComponent(url ? url.substring(url.indexOf('#') + 1) : window.location.hash.substr(1));
    }
    const hash = getHash(this.props.location.hash).split('&');
    const payStatusIndex = hash.findIndex(ele => ele.indexOf(key) === 0);
    return payStatusIndex !== -1 ? hash[payStatusIndex].split('=')[1] : '';
  }

  getDetailRows = (data) => {
    // const {
    //   OrderStatus = {},
    //   ProductGroup = {},
    // } = this.config;
    // const rows = [...(data.Service !== 'ecs' ? detailHeaderRows : ecsHeaderRows)];
    // rows[0][0].value.content = data.ProductGroupId + (ProductGroup[data.ProductGroupId] ? `(${ProductGroup[data.ProductGroupId]})` : '');
    // rows[1][0].value.content = getTimeRangeString('', data, {}, false);
    // rows[2][0].value.content = `￥${data.BillAmount}`;
    // rows[2][1].value.content = OrderStatus[+data.Status];

    const {
      OrderStatus = {},
      ProductGroup = {},
    } = this.config;
    let rows = [...detailHeaderRows];
    rows[0][0].value.content = data.ProductGroupId + (ProductGroup[data.ProductGroupId] ? `(${ProductGroup[data.ProductGroupId]})` : '');
    rows[1][0].value.content = data.InstanceId;
    rows[2][0].value.content = getTimeRangeString('', data, {}, false);
    rows[3][0].value.content = `￥${data.BillAmount}`;
    rows[3][1].value.content = OrderStatus[+data.Status];
    const customer = this.getHashValueByKey('_customer');
    const servicetree = this.getHashValueByKey('_servicetree');
    if (customer) {
      rows.push(
        [{ label: { span: 2, content: '基本信息:' }, value: { span: 8, content: customer } }]
      );
    }
    if (servicetree) {
      rows.push(
        [{ label: { span: 2, content: '服务树:' }, value: { span: 8, content: servicetree } }]
      );
    }
    if (!data.InstanceId) {
      rows.splice(1,1);
    }
    return rows;
  }

  getDetailTables = (data) => {
    const {
      BillingMethodCategory = {},
      BillingMethodName = {},
      BillingMethodSubCategory = {},
      ProductGroup = {},
      CommonService
    } = this.config;
    const billMethods = {};
    if (data && data.Measures) {
      const { Measures = [] } = data;
      Measures.forEach(measure => {
        measure.Period = data.Period;
        let tableDemo = { columns: [], rowKey: 'Id' };
        try {
          tableDemo = getTable(measure.Category === 'ecs' ? measure.SubCategory : measure.Category, data.ProductGroupId, measure, this.config);
        } catch (e) {
          console.log(e);
          message.error('错误的账单结构');
        }
        const Metrology = JSON.parse(measure.Metrology);
        if (Metrology.Codec && Metrology.Definition) {
          measure.Codec = Metrology.Codec;
          measure.Definition = Metrology.Definition;
        }
        measure.Metrologies = Metrology;
        measure.SubCategoryCN = BillingMethodSubCategory[measure.SubCategory] || measure.SubCategory;
        measure.BillingMethodCN = BillingMethodName[Metrology.BillingMethodId] || Metrology.BillingMethodId;
        if (billMethods[measure.Category]) {
          billMethods[measure.Category].dataSource.push(measure);
        } else {
          billMethods[measure.Category] = {
            ...tableDemo,
            dataSource: [measure],
            title: () => {
              if (CommonService[data.Service] && CommonService[data.Service].spec && CommonService[data.Service].spec[measure.Category]) {
                return CommonService[data.Service].spec[measure.Category].name;
              }
              return `计费项-${
                BillingMethodCategory[data.Service] && BillingMethodCategory[data.Service][measure.Category]
                  ? BillingMethodCategory[data.Service][measure.Category]
                  : (ProductGroup[measure.SubCategory] || measure.Category)
              }`;
            }
          };
        }
      });
    }
    const tables = Object.keys(billMethods).map(category => billMethods[category]);
    return tables;
  }

  render() {
    return (
      <DetailPage
        backLink={`../${this.props.location.hash}`}
        barTitle={`账单号: ${this.state.bill.Id}`}
        backText="返回账单管理列表"
        headerConfig={this.state.headerConfig}
        tableConfig={this.state.tableConfig}
        dataReady={this.state.dataReady}
      />);
  }
}