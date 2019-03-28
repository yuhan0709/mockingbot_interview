import React, { Component } from 'react';
import { Tabs } from 'antd';
import Cn from './cn';
import I18n from './I18n/i18n';
import Space from './space';
import style from '../style.less';

const TabPane = Tabs.TabPane;

class CostStatistics extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className={style.statistic}>
        <Tabs defaultActiveKey="cn" onChange={this.toggleTabs}>
          <TabPane tab="国内" key="cn"><Cn/></TabPane>
          <TabPane tab="海外" key="i18n"><I18n/></TabPane>
          <TabPane tab="存储服务" key="space"><Space/></TabPane>
        </Tabs>
      </div>
    );
  }
}

export default CostStatistics;