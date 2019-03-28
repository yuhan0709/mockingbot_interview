import React, { Component } from 'react';
import { Tabs } from 'antd';
import Cn from './cn';
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
        <Tabs defaultActiveKey="cn">
          <TabPane tab="国内" key="cn"><Cn/></TabPane>
        </Tabs>
      </div>
    );
  }
}

export default CostStatistics;