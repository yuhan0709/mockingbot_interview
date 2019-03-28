import React from 'react';
import Apis from '../../util/request';
import moment from 'moment';
import Filter from './Filter';
import { gerService } from '../../util';
import style from './style.less';
import Link from '@component/Link';
import StackedColumnChart from './component/BizStackedColumnChart';
import LineChart from './component/BizLineChart';
import CostRateChart from './costRateChart';
import CostTrandChart from './costTrandChart';
import { formatCostValue, htmlContent } from './util';
import { Radio, Tabs, Table, Divider, Select, message, Tooltip } from 'antd';

const { Option, OptGroup } = Select;
const TabPane = Tabs.TabPane;
const TooltipProps = { htmlContent };


function getProductGroupName(id, service, config) {
  if (config.ProductGroupOfService && config.ProductGroupOfService[service] && config.ProductGroupOfService[service][id]) {
    return config.ProductGroupOfService[service][id];
  }
  if (id === service && config.Service && config.Service[id]) {
    return config.Service[id];
  }
  return id;
}

const expenseConfig = window.INIT_CONFIG.expenseConfig;

let authorisedServices = gerService('bill');
authorisedServices = (function(){
  let res = {};
  Object.keys(expenseConfig.Service).forEach(key => {
    authorisedServices.forEach(as =>{
      if (key === as.Name) {
        res[key] = expenseConfig.Service[key];
      }
    });
  });
  return res;
})();
export default class Overview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      realTimeInfo: {},
      chartData: [],
      chartType: 'line',
      summary: 'product',
      smId: 0,
      smData: [],
      productTrendKey: '1',
      tagTrendKey: '1',
      productSelectedRowKeysMap: {},
      tagSelectedRowKeysMap: {},
      productCurrentPage: 0,
      tagCurrentPage: 0,
      CostOfServiceTree: [],
      CostOfProductGroup: [],
      monthTimeStampList: []
    };
  }
  services = authorisedServices || {};
  ServiceOfProductGroup= expenseConfig.ServiceOfProductGroup || {}
  ProductGroup= expenseConfig.ProductGroup || {}

  componentDidMount = async () => {
    this.RealTimeTradeInfo();
  }

  RealTimeTradeInfo = async() => {
    const params = {};
    if (this.state.product) {
      params.ProductGroups = this.state.product;
    }
    if (!params.ProductGroups) {
      delete params.ProductGroups;
      params.Services = gerService('bill').map(service => service.Name).toString();
    } else {
      delete params.Services;
    }
    let hide = () =>  {};
    let clear = setTimeout(() => {
      hide = message.loading('账单拉取中...', 0);
    }, 500);
    const res = await Apis.RealTimeTradeInfo({
      ...params
    });
    clearTimeout(clear);
    hide();
    if (res) {
      this.setState({
        realTimeInfo: res
      });
    }
  }

  getBills = async (params) => {
    const times = {};
    if (params.BeginTime) {
      times.BeginTime = moment(params.BeginTime).unix();
    }
    if (params.EndTime) {
      times.EndTime = moment(params.EndTime).unix();
    }
    this.setState({
      ...times,
      ServiceTree: params.ServiceTree,
      Customer: params.Customer
    });
    this.getSummaryBill(params);
  }

  MonthlyApiCounter = 0
  getSummaryMonthlyBill = async (params, BeginTime, EndTime) => {
    const BeginMoment = moment(BeginTime);
    const EndMoment = moment(EndTime).add('1', 'months');
    this.MonthlyApiCounter = this.MonthlyApiCounter + 1;
    const counter = this.MonthlyApiCounter;
    const CostOfMonth = await Apis.SummaryMonthlyBill({
      ...params
    });
    if (this.MonthlyApiCounter !== counter) {
      return;
    }
    const monthCostMap = {};
    CostOfMonth.map(cost => {
      monthCostMap[cost.Month] = ({ Key: 'cost', Value: cost.Cost, Timestamp: +moment(cost.Month) });
    });
    const monthTimeStampList = [];
    const chartData = [];
    if (BeginMoment && EndMoment && +EndMoment > +BeginMoment) {
      let curMonth = BeginMoment;
      const EndMonth = EndMoment.format('YYYY-MM');
      while (curMonth.format('YYYY-MM') !== EndMonth) {
        monthTimeStampList.push(curMonth.startOf('month').valueOf());
        const monthString = curMonth.format('YYYY-MM');
        if (monthCostMap[monthString]) {
          chartData.push(monthCostMap[monthString]);
        } else {
          chartData.push({ Key: 'cost', Value: 0, Timestamp: +curMonth });
        }
        curMonth = curMonth.add('1', 'months');
      }
    }
    this.setState({
      monthTimeStampList,
      chartData,
    });
  }

  ProductGroupApiCounter = 0
  getSummaryProductGroupMonthlyBill = async (params, BeginTime, EndTime) => {
    const BeginMoment = moment(BeginTime);
    const EndMoment = moment(EndTime).add('1', 'months');
    this.ProductGroupApiCounter = this.ProductGroupApiCounter + 1;
    const counter = this.ProductGroupApiCounter;
    const CostOfProductGroup = await Apis.SummaryProductGroupMonthlyBill({
      ...params
    });
    if (this.ProductGroupApiCounter !== counter) {
      return;
    }
    CostOfProductGroup.forEach((cop,i) => {
      cop.rank = i + 1 + '';
      cop.title = getProductGroupName(cop.ProductGroupId, cop.Service, expenseConfig);
    });
    const monthTimeStampList = [];
    if (BeginMoment && EndMoment && +EndMoment > +BeginMoment) {
      let curMonth = BeginMoment;
      const EndMonth = EndMoment.format('YYYY-MM');
      while (curMonth.format('YYYY-MM') !== EndMonth) {
        monthTimeStampList.push(curMonth.startOf('month').valueOf());
        const monthString = curMonth.format('YYYY-MM');
        CostOfProductGroup.forEach(copg => {
          if (!copg.MonthlyCost[monthString]) {
            copg.MonthlyCost[monthString] = 0;
          }
        });
        curMonth = curMonth.add('1', 'months');
      }
    }
    const productSelectedRowKeysMap = {};
    CostOfProductGroup.forEach((_, index) => productSelectedRowKeysMap[index + 1] = true);
    this.setState({
      monthTimeStampList,
      CostOfProductGroup,
      productSelectedRowKeysMap
    });
  }

  ServiceTreeApiCounter = 0
  getSummaryServiceTreeMonthlyBill = async (params, BeginTime, EndTime) => {
    const BeginMoment = moment(BeginTime);
    const EndMoment = moment(EndTime).add('1', 'months');
    this.ServiceTreeApiCounter = this.ServiceTreeApiCounter + 1;
    const counter = this.ServiceTreeApiCounter;
    const CostOfServiceTree = await Apis.SummaryServiceTreeMonthlyBill({
      ...params
    });
    if (this.ServiceTreeApiCounter !== counter) {
      return;
    }
    CostOfServiceTree.forEach((cos,i) => {
      cos.rank = i + 1 + '';
    });
    const monthTimeStampList = [];
    if (BeginMoment && EndMoment && +EndMoment > +BeginMoment) {
      let curMonth = BeginMoment;
      const EndMonth = EndMoment.format('YYYY-MM');
      while (curMonth.format('YYYY-MM') !== EndMonth) {
        monthTimeStampList.push(curMonth.startOf('month').valueOf());
        const monthString = curMonth.format('YYYY-MM');
        CostOfServiceTree.forEach(cost => {
          if (!cost.MonthlyCost[monthString]) {
            cost.MonthlyCost[monthString] = 0;
          }
        });
        curMonth = curMonth.add('1', 'months');
      }
    }
    const tagSelectedRowKeysMap = {};
    CostOfServiceTree.forEach((_, index) => tagSelectedRowKeysMap[index + 1] = true);
    this.setState({
      monthTimeStampList,
      tagSelectedRowKeysMap,
      CostOfServiceTree
    });
  }

  getSummaryBill = async(data) => {
    const params = { ...data };
    const {
      BeginTime,
      EndTime,
    } = data;
    if (params.ServiceTree === '|') {
      params.ServiceTree = 'all';
    }
    if (this.state.product) {
      params.ProductGroups = this.state.product;
    }
    if (!params.ProductGroups) {
      delete params.ProductGroups;
      params.Services = gerService('bill').map(service => service.Name).toString();
    } else {
      delete params.Services;
    }
    this.getSummaryMonthlyBill(params, BeginTime, EndTime);
    this.getSummaryProductGroupMonthlyBill(params, BeginTime, EndTime);
    this.getSummaryServiceTreeMonthlyBill(params, BeginTime, EndTime);
  }

  serviceChange = e => {
    const params = {};
    if (e.length === 1 && this.state.summary === 'product') {
      params.summary = 'tag';
    }
    this.setState({
      ...params,
      product: e.toString()
    },() => {
      this.RealTimeTradeInfo();
    });
  }

  ref = null

  setRef = ref => {
    this.ref = ref;
  }

  render() {
    const {
      realTimeInfo = {},
    } = this.state;

    const {
      YesterdayBillTotalSum,
      CurrentMonthBillTotalSum,
      CustomerCount,
    } = realTimeInfo;
    const scale = {
      Timestamp: {
        alias: '时间',
        type: 'time',
        mask: 'YYYY-MM',
        nice: false,
        ticks: this.state.monthTimeStampList,
        subTickCount: this.state.monthTimeStampList.length
      },
      Value: {
        alias: '消费额(元)',
        type: 'linear',
        subTickCount: 5
      },
      type: {
        type: 'cat'
      }
    };

    return (
      <div className={style.container} ref={this.setRef} style={{ position: 'relative' }}>
        <h2 className="content-header">账单总览</h2>
        <span className="common-box">
            产品名称:
        </span>
        <Select getPopupContainer={() => this.ref} mode="multiple" style={{ width: 300 }} onChange={this.serviceChange}  className="common-box">
          {
            Object.keys(this.services).map((key) => {
              return (
                <OptGroup label={this.services[key]} key={key}>
                  {Object.keys(this.ProductGroup).map((groupId) => {
                    if (this.ServiceOfProductGroup[groupId] === key) {
                      return (
                        <Option key={groupId} value={groupId}>{this.ProductGroup[groupId]}</Option>
                      );
                    } else {
                      return '';
                    }
                  })}
                </OptGroup>
              );
            })
          }
        </Select>
        <div className="content-box">
          <h3>实时数据</h3>
          <div className={style['realtime-info']}>
            <div>
              <div className={style.count}><span className={style.number}>{YesterdayBillTotalSum ? (YesterdayBillTotalSum.BillAmount.toFixed(2) - 0).toLocaleString() : ''}</span>{YesterdayBillTotalSum ? ' 元' : ''}</div>
              <div>昨日客户消费</div>
            </div>
            <div>
              <div className={style.count}><span className={style.number}>{CurrentMonthBillTotalSum ? (CurrentMonthBillTotalSum.BillAmount.toFixed(2) - 0).toLocaleString() : ''}</span>{CurrentMonthBillTotalSum ? ' 元' : ''}</div>
              <div>本月客户消费</div>
            </div>
            <div>
              <div className={style.count}><span className={style.number}>{CustomerCount ? (CustomerCount - 0).toLocaleString() : CustomerCount}</span>{CustomerCount || CustomerCount === 0 ? ' 个' : ''}</div>
              <div>客户数</div>
            </div>
          </div>
        </div>
        <div className="content-box">
          <Filter
            product={this.state.product}
            smData={this.state.smData}
            monthMode
            search={this.getBills}
            services={this.services}
          />
          <span style={{ fontWeight: 500,marginLeft: 50 }}>
            消费总计：
            {this.state.CostOfProductGroup.reduce((acc, cur) => {
              return acc += cur.Cost;
            },0).toFixed(2)}元
            &nbsp;&nbsp;&nbsp;
            产品总计：
            {this.state.CostOfProductGroup.length}个
          </span>
          <div style={{ marginTop: 20, zIndex: 1 }}>
            <span style={{ fontWeight: 500,marginLeft: 50 }}>
              时间趋势：
            </span>
            <Radio.Group size="small" value={this.state.chartType} onChange={type => {
              this.setState({
                chartType: type.target.value
              });
            }}>
              <Radio.Button value="line">折线图</Radio.Button>
              <Radio.Button value="stack">柱状图</Radio.Button>
            </Radio.Group>
          </div>
          <div style={{ marginLeft: 50 }}>
            {
              this.state.chartType === 'line'
                ? <LineChart
                  data={this.state.chartData}
                  xAxisFormat="YYYY-MM"
                  scaleType="timeCat"
                  showLegend={false}
                  format={formatCostValue}
                  TooltipProps={TooltipProps}
                  scale={scale}
                />
                : <StackedColumnChart
                  data={this.state.chartData}
                  xAxisFormat="YYYY-MM"
                  scaleType="timeCat"
                  showLegend={false}
                  format={formatCostValue}
                  TooltipProps={TooltipProps}
                  scale={scale}
                />
            }
          </div>

          <div style={{ position: 'relative', marginLeft: 50 }}>
            <Radio.Group value={this.state.summary} onChange={e => {
              this.setState({
                summary: e.target.value
              });
            }}>

              {(!this.state.product || this.state.product.split(',').length !== 1)  &&  <Radio.Button value="product">按产品汇总</Radio.Button>}
              {this.state.ServiceTree && <Radio.Button value="tag">按服务树次级汇总</Radio.Button>}
              {/* <Radio.Button value="status">按支付状态汇总</Radio.Button> */}
            </Radio.Group>
            {this.state.summary === 'product' && <Tabs activeKey={this.state.productTrendKey} onChange={productTrendKey => {
              this.setState({
                productTrendKey
              });
            }} size="small">
              <TabPane tab="消费比例" key="1">
                <CostRateChart
                  costData={this.state.CostOfProductGroup}
                />
                <Table
                  size="small"
                  dataSource={this.state.CostOfProductGroup}
                  columns={[
                    {
                      title: '消费排名',
                      dataIndex: 'rank',
                      key: 'rank',
                    },{
                      title: '产品名称',
                      dataIndex: 'title',
                      key: 'title',
                    },{
                      title: '应付金额',
                      dataIndex: 'Cost',
                      key: 'Cost',
                      render: cost => cost.toFixed(2)
                    },{
                      title: '操作',
                      dataIndex: 'c',
                      key: 'c',
                      render: (_, record) => {
                        let customer = '';
                        if (this.state.Customer) {
                          customer = '&customer=' + this.state.Customer;
                        }
                        return <span>
                          <a onClick={() => {
                            this.setState({
                              productSelectedRowKeysMap: { [record.rank]: true },
                              productTrendKey: '2'
                            });
                          }}>时间趋势图</a>
                          <Divider type="vertical" />
                          <Link to={`/app/billing/bill/all/#summary${customer}&productId=${record.ProductGroupId}&beginTime=${this.state.BeginTime}&endTime=${this.state.EndTime}&serviceTree=${this.state.ServiceTree}`}>
                            查看账单
                          </Link>
                        </span>;
                      }
                    }
                  ]}
                  rowKey="rank"
                  pagination={{
                    showQuickJumper: true,
                    pageSize: 10,
                    current: this.state.productCurrentPage,
                    onChange: productCurrentPage => {
                      this.setState({
                        productCurrentPage
                      });
                    },
                    showTotal: a => {
                      return `共有 ${a} 条数据，每页显示 10 条`;
                    }
                  }}
                />
              </TabPane>
              <TabPane tab="时间趋势" key="2">
                <CostTrandChart
                  costData={this.state.CostOfProductGroup.filter((_, index) => this.state.productSelectedRowKeysMap[index + 1])}
                  scale={scale}
                />
                <Table
                  size="small"
                  dataSource={this.state.CostOfProductGroup}
                  columns={[
                    {
                      title: '消费排名',
                      dataIndex: 'rank',
                      key: 'rank',
                    },{
                      title: '产品名称',
                      dataIndex: 'title',
                      key: 'title',
                    },{
                      title: '应付金额',
                      dataIndex: 'Cost',
                      key: 'Cost',
                      render: cost => cost.toFixed(2)
                    },{
                      title: '操作',
                      dataIndex: 'c',
                      key: 'c',
                      render: (_, record) => {
                        let customer = '';
                        if (this.state.Customer) {
                          customer = '&customer=' + this.state.Customer;
                        }
                        return <Link to={`/app/billing/bill/all/#summary${customer}&productId=${record.ProductGroupId}&beginTime=${this.state.BeginTime}&endTime=${this.state.EndTime}&serviceTree=${this.state.ServiceTree}`}>
                        查看账单
                        </Link>;
                      }
                    }
                  ]}
                  rowSelection={{
                    selectedRowKeys: Object.keys(this.state.productSelectedRowKeysMap),
                    onChange: (selectedRowKeys) => {
                      const productSelectedRowKeysMap = {};
                      (selectedRowKeys + '').split(',').forEach(key => {
                        productSelectedRowKeysMap[key] = true;
                      });
                      this.setState({
                        productSelectedRowKeysMap
                      });
                    }
                  }}
                  rowKey="rank"
                  pagination={{
                    showQuickJumper: true,
                    pageSize: 10,
                    current: this.state.productCurrentPage,
                    onChange: productCurrentPage => {
                      this.setState({
                        productCurrentPage
                      });
                    },
                    showTotal: a => {
                      return `共有 ${a} 条数据，每页显示 10 条`;
                    }
                  }}
                />
              </TabPane>
            </Tabs> }
            {this.state.summary === 'tag' && <Tabs activeKey={this.state.tagTrendKey} onChange={tagTrendKey => {
              this.setState({
                tagTrendKey
              });
            }} size="small">
              <TabPane tab="消费比例" key="1">
                <CostRateChart
                  costData={this.state.CostOfServiceTree}
                />
                <Table
                  size="small"
                  dataSource={this.state.CostOfServiceTree}
                  columns={[
                    {
                      title: '消费排名',
                      dataIndex: 'rank',
                      key: 'rank',
                    },{
                      title: '服务树次级',
                      dataIndex: 'ServiceTree',
                      key: 'ServiceTree',
                    },{
                      title: '应付金额',
                      dataIndex: 'Cost',
                      key: 'Cost',
                      render: cost => cost.toFixed(2)
                    },{
                      title: '操作',
                      dataIndex: 'c',
                      key: 'c',
                      render: (_, record) => {
                        let customer = '';
                        if (this.state.Customer) {
                          customer = '&customer=' + this.state.Customer;
                        }
                        return <span>
                          <a onClick={() => {
                            this.setState({
                              tagSelectedRowKeysMap: { [record.rank]: true },
                              tagTrendKey: '2'
                            });
                          }}>时间趋势图</a>
                          <Divider type="vertical" />
                          {
                            record.ServiceTree !== '无'
                              ? <Link to={`/app/billing/bill/all/#summary${customer}&serviceTree=${record.ServiceTree}&beginTime=${this.state.BeginTime}&endTime=${this.state.EndTime}`}>
                              查看账单
                              </Link>
                              : <Tooltip title="暂不支持单独筛选出未挂在服务树上的账单">
                                <span>
                                  <Link disabled to=''>
                                查看账单
                                  </Link>
                                </span>
                              </Tooltip>
                          }
                        </span>;
                      }
                    }
                  ]}
                  rowKey="rank"
                  pagination={{
                    showQuickJumper: true,
                    pageSize: 10,
                    current: this.state.tagCurrentPage,
                    onChange: tagCurrentPage => {
                      this.setState({
                        tagCurrentPage
                      });
                    },
                    showTotal: a => {
                      return `共有 ${a} 条数据，每页显示 10 条`;
                    }
                  }}
                />
              </TabPane>
              <TabPane tab="时间趋势" key="2">
                <CostTrandChart
                  costData={this.state.CostOfServiceTree.filter((_, index) => this.state.tagSelectedRowKeysMap[index + 1])}
                  scale={scale}
                />
                <Table
                  size="small"
                  dataSource={this.state.CostOfServiceTree}
                  columns={[
                    {
                      title: '消费排名',
                      dataIndex: 'rank',
                      key: 'rank',
                    },{
                      title: '服务树次级',
                      dataIndex: 'ServiceTree',
                      key: 'ServiceTree',
                    },{
                      title: '应付金额',
                      dataIndex: 'Cost',
                      key: 'Cost',
                      render: cost => cost.toFixed(2)
                    },{
                      title: '操作',
                      dataIndex: 'c',
                      key: 'c',
                      render: (_, record) => {
                        let customer = '';
                        if (this.state.Customer) {
                          customer = '&customer=' + this.state.Customer;
                        }
                        return record.ServiceTree !== '无'
                          ? <Link to={`/app/billing/bill/all/#summary${customer}&serviceTree=${record.ServiceTree}&beginTime=${this.state.BeginTime}&endTime=${this.state.EndTime}`}>
                          查看账单
                          </Link>
                          : <Tooltip title="暂不支持单独筛选出未挂在服务树上的账单">
                            <span>
                              <Link disabled to=''>
                              查看账单
                              </Link>
                            </span>
                          </Tooltip>;
                      }
                    }
                  ]}
                  rowSelection={{
                    selectedRowKeys: Object.keys(this.state.tagSelectedRowKeysMap),
                    onChange: selectedRowKeys => {
                      const tagSelectedRowKeysMap = {};
                      (selectedRowKeys + '').split(',').forEach(key => {
                        tagSelectedRowKeysMap[key] = true;
                      });
                      this.setState({
                        tagSelectedRowKeysMap
                      });
                    }
                  }}
                  rowKey="rank"
                  pagination={{
                    showQuickJumper: true,
                    pageSize: 10,
                    current: this.state.tagCurrentPage,
                    onChange: tagCurrentPage => {
                      this.setState({
                        tagCurrentPage
                      });
                    },
                    showTotal: a => {
                      return `共有 ${a} 条数据，每页显示 10 条`;
                    }
                  }}
                />
              </TabPane>
            </Tabs>}
            {
              this.state.summary === 'status' && <div>123</div>
            }
          </div>
        </div>
      </div>
    );
  }
}