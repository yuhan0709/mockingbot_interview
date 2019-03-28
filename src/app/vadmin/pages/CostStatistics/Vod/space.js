import React, { Component } from 'react';
import BizLineChart from '../BizLineChart/index';
import { Spin,Divider } from 'antd';
import Search from '../search';
import { getData } from '../util';
import Rank from '../rank';
import Request from '../../../util/request';

const {
  GetTopAppsByStorage,
  GetStorageStatistics
} = Request;

class Space extends Component {
  param = {}

  constructor(props) {
    super(props);
    this.state = {
      spinning: false,
      storageData: [],
      storageOperation: {}
    };
  }

  async componentDidMount() {
    await this.initTopSpace();
  }

  initTopSpace = async () => {
    const TopData = await GetTopAppsByStorage({ Limit: 20 });
    const topData = TopData.Applications.map((e, index) => {
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
      const { StorageStatistics } = await GetStorageStatistics({
        ...this.param
      });
      let { data: storageData,maxNodes } = getData(StorageStatistics);
      const maxPeak = Math.max(...StorageStatistics.map(item => item.Peak)) || Math.max(...storageData.map(item => item.Value));
      const peak95Arr = StorageStatistics.map(item => {
        const { Peak95, Vender } = item;
        return {
          Peak95,
          Vender
        };
      });
      this.setState({
        storageData,
        storageOperation: { type: 'space', maxPeak,peak95Arr,start: storageData[0],end: storageData[storageData.length - 1],maxNodes },
        spinning: false
      });
    } catch (e) {
      this.setState({
        storageData: [],
        spinning: false
      });
      console.error(e);
      // message.error('获取数据出错！请联系管理员~');
    }
  }

  render() {
    return (
      <div className="common-bottom">
        <div>
          <Spin tip="查询数据中..." spinning={this.state.spinning}>

            <Search type="Storage" onSubmit={this.search} exportFunc={'GetStorageStatistics'}/>
            <BizLineChart data={this.state.storageData} {...this.state.storageOperation}/>

          </Spin>
          <Divider/>
          <Rank dataSource={this.state.topData} type="space"/>
        </div>
      </div>
    );
  }
}

export default Space;