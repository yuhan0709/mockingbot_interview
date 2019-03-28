import React from 'react';
import { Tabs } from 'antd';
import { withRouter } from 'react-router';
import RunningBill from './runningBill';
import SummaryBill from './summaryBill';

const TabPane = Tabs.TabPane;
@withRouter
export default class BillManage extends React.Component {

  state = {
    activeKey: '#running',
    RunningBillKey: 1,
  }

  componentDidMount() {
    function getHash(url) {
      return decodeURIComponent(url ? url.substring(url.indexOf('#') + 1) : window.location.hash.substr(1));
    }
    const hash = getHash(this.props.location.hash).split('&');
    let activeKey = '#running';
    hash.forEach(ele => {
      if (ele.indexOf('summary') === 0) {
        activeKey = '#summary';
      }
    });
    this.setState({
      activeKey
    });
  }

  render() {
    return (<div>
      <Tabs activeKey={this.state.activeKey} onChange={activeKey => {
        this.setState({
          activeKey,
        });
      }} tabBarStyle={{
        marginbottom: '15px',
        background: 'white'
      }}>
        <TabPane tab="流水账单" key="#running"><RunningBill key={this.state.RunningBillKey} initData={this.state.RunningBillInitData}/></TabPane>
        <TabPane tab="账单汇总" key="#summary"><SummaryBill toRunningBill={initData => {
          this.setState({
            activeKey: '#running',
            RunningBillKey: this.state.RunningBillKey + 1,
            RunningBillInitData: initData
          });
        }}/></TabPane>
      </Tabs>
    </div>);
  }
}