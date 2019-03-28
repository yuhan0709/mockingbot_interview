import React, { Component } from 'react';
import { Spin,Divider } from 'antd';
import Search from './search';
import BizLineChart from '../../BizLineChart/index';
import Request from '../../../../util/request';
import { getData } from '../../util';
import Rank from '../../rank';
import { formatByte } from '../../../../util/valueFormat';
import style from '../../style.less';

const {
  GetTopOverseaDomainsByBandwidth,
  GetOverseaFlowStatistics
} = Request;
class I18n extends Component {
  param = {}

  constructor(props) {
    super(props);
    this.state = {
      spinning: false,
      regions: [],
      data: [],
      chartOptions: {}
    };
  }

  async componentDidMount() {
    await this.initTopDomain();
  }

  initTopDomain = async () => {
    const TopData = await GetTopOverseaDomainsByBandwidth({ Limit: 20 });
    const topData = TopData.Domains.map((e, index) => {
      return {
        index: index + 1,
        ...e
      };
    });
    this.setState({
      topData
    });
  }

  search = async (param) => {
    this.param = param;
    await this.checkPage();
  }

  checkPage = async () => {
    try {
      this.setState({
        spinning: true
      });
      const { FlowStatistics } = await GetOverseaFlowStatistics({
        ...this.param
      });
      let { data } = getData([FlowStatistics]);
      this.setState({
        data,
        chartOptions: {
          type: 'flow',
          TotalFlow: FlowStatistics.TotalFlow
        },
        spinning: false
      });
    } catch (e) {
      this.setState({
        data: [],
        spinning: false
      });
      console.error(e);
    }
  }

  render() {
    return (
      <div className="common-bottom">
        <div>
          <Spin tip="查询数据中..." spinning={this.state.spinning}>

            <Search type="Flow" onSubmit={this.search}/>
            <BizLineChart data={this.state.data} {...this.state.chartOptions}/>
            {this.state.chartOptions.TotalFlow  ? <h3 className={style.totalFlow}>所选时间段的流量值：{formatByte(this.state.chartOptions.TotalFlow)}</h3> : null}
          </Spin>
          <Divider/>
          <Rank dataSource={this.state.topData} type="flow"/>
        </div>
      </div>
    );
  }
}

export default I18n;