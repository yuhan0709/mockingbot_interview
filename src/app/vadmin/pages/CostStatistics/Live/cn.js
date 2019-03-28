import React, { Component } from 'react';
import BizLineChart from '../BizLineChart/index';
import { Table,Divider,Spin } from 'antd';
import Search from '../search';
import { getData } from '../util';
import Rank from '../rank';
import Request from '../../../util/request';
import { M } from '../../../util/valueFormat';

const {
  GetTopLiveDomainsByBandwidth,
  GetLiveBandwidthStatistics
} = Request;

class Cn extends Component {
  param = {}

  constructor(props) {
    super(props);
    this.state = {
      spinning: false,
      regions: [],
      bandwidthData: [],
      bandwidthOperation: {}
    };
  }

  async componentDidMount() {
    await this.initTopDomain();
  }

  search = async (param) => {
    this.param = param;
    await this.checkPage();
  }

  initTopDomain = async () => {
    const TopData = await GetTopLiveDomainsByBandwidth({ Limit: 20 });
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

  checkPage = async () => {
    try {
      this.setState({
        spinning: true
      });
      const { BandwidthStatistics } = await GetLiveBandwidthStatistics({
        ...this.param
      });
      let { data: bandwidthData,maxNodes } = getData(BandwidthStatistics);
      const maxPeak = Math.max(...BandwidthStatistics.map(item => item.Peak)) || Math.max(...bandwidthData.map(item => item.Value));
      const peak95Arr = BandwidthStatistics.map(item => {
        const { Peak95, Vender } = item;
        return {
          Peak95,
          Vender
        };
      });
      // console.log(1111,maxPeak,peak95Arr,maxNodes)
      this.setState({
        bandwidthData,
        bandwidthOperation: {
          type: 'bandwidth',
          maxPeak,
          peak95Arr,
          start: bandwidthData[0],
          end: bandwidthData[bandwidthData.length - 1],
          maxNodes
        },
        BandwidthStatistics,
        spinning: false
      });
    } catch (e) {
      this.setState({
        bandwidthData: [],
        spinning: false
      });
      console.error(e);
      // message.error('获取数据出错！请联系管理员~');
    }
  }

  render() {
    const columns = [{
      title: '供应商',
      dataIndex: 'Vender',
      key: 'Vender',
      align: 'center',
      width: '33.3%',
      // render: vender => venderMap[vender] ? venderMap[vender].name : vender
    }, {
      title: '95带宽峰值',
      dataIndex: 'Peak95',
      key: 'Peak95',
      align: 'center',
      width: '33.3%',
      render: bandwidth => bandwidth / M + 'Mbps'
    }, {
      title: '带宽峰值',
      dataIndex: 'Peak',
      key: 'Peak',
      align: 'center',
      width: '33.3%',
      render: bandwidth => bandwidth / M + 'Mbps'
    }];

    return (
      <div className="common-bottom">
        <div>
          <Spin tip="查询数据中..." spinning={this.state.spinning}>
            <Search type="LiveBandwidth" onSubmit={this.search} exportFunc={'GetLiveBandwidthStatistics'}/>

            <BizLineChart data={this.state.bandwidthData} {...this.state.bandwidthOperation}/>
            <Table size="small" rowKey="Vender" dataSource={this.state.BandwidthStatistics} columns={columns} pagination={false}/>
          </Spin>

          <Divider/>

          <Rank dataSource={this.state.topData}/>
        </div>
      </div>
    );
  }
}

export default Cn;