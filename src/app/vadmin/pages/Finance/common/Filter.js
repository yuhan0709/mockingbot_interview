import React, { Component } from 'react';
import { Select, DatePicker ,Button ,Input, Radio, Checkbox } from 'antd';
const Option = Select.Option;
const { RangePicker } = DatePicker;
import PropTypes from 'prop-types';

class Filter extends Component {
  static defaultProps = {
    services: {},
    status: {},
    hideZeroOrder: ()=>{},
    search: ()=>{},
    showAccountInput: true,
    showPayType: false,
    showHideTip: false,
  }
  static propTypes = {
    services: PropTypes.object
  }
  state = {
    filterObj: {
      PayType: 'post'
    },
    PayType: 'post',
    modalVisible: false
  }
  payType='post';

  componentDidMount() {
  }
  serviceChange = (val) => {
    if (val == 'all') {
      delete this.state.filterObj.Services;
      return;
    }
    this.setState({
      filterObj: {
        ...this.state.filterObj,
        Services: val
      }
    });
  }
  statusChange = (val) => {
    if (val == 'all') {
      delete this.state.filterObj.Status;
      return;
    }
    this.setState({
      filterObj: {
        ...this.state.filterObj,
        Status: val
      }
    });
  }
  handleDateChange = (val) => {
    if (!val[0] || !val[1]) {
      delete this.state.filterObj.BeginTime;
      delete this.state.filterObj.EndTime;
      return;
    }
    this.setState({
      filterObj: {
        ...this.state.filterObj,
        BeginTime: val[0],
        EndTime: val[1]
      }
    });
  }
  accountChange = (e) => {
    if (!e.target.value) {
      delete this.state.filterObj.AccountIds;
      return;
    }
    this.setState({
      filterObj: {
        ...this.state.filterObj,
        AccountIds: e.target.value
      }
    });
  }
  search = (params, payType) => {
    let time = {};
    if (params.BeginTime) {
      time.BeginTime = params.BeginTime.startOf('day').toISOString();
    }
    if (params.EndTime) {
      time.EndTime = params.EndTime.endOf('day').toISOString();
    }
    if (payType == 'post') {
      this.props.getPosts({
        ...params,
        ...time,
        PayType: payType
      });
    } else {
      this.props.getPres({
        ...params,
        ...time,
        PayType: payType
      });
    }
  }
  payTypeChange = (e) => {
    this.setState({
      PayType: e.target.value,
    });
    this.payType = e.target.value;
    this.search(this.state.filterObj, this.payType);
  }
  render() {
    return (
      <div className="common-bottom">
        <div>
          {/* <span className="common-box">
          产品名称:
          </span>
          <Select defaultValue="all" style={{ width: 100 }} onChange={this.serviceChange}  className="common-box">
            <Option value="all">全部</Option>
            {
              Object.keys(this.props.services).map((key) => {
                return (
                  <Option key={key} value={key}>{this.props.services[key]}</Option>
                );
              })
            }
          </Select> */}
          {(() => {
            if (this.state.PayType == 'post' || this.props.showPayType) {
              return (
                <span>
                  <span className="common-box">支付状态:</span>
                  <Select defaultValue="all" style={{ width: 100 }} onChange={this.statusChange}  className="common-box">
                    <Option value="all">全部</Option>
                    {
                      Object.keys(this.props.status).map((key) => {
                        return (
                          <Option key={key} value={key}>{this.props.status[key]}</Option>
                        );
                      })
                    }
                  </Select>
                </span>
              );
            }
          })()}

          <RangePicker className="common-box" style={{ width: 230 }} onChange={this.handleDateChange} />
          {
            this.props.showAccountInput && (
              <span>
                <span className="common-box">用户名:</span>
                <Input
                  className="common-box"
                  placeholder="请输入用户名搜索"
                  onChange={this.accountChange}
                  style={{ width: 140 }}
                />
              </span>
            )
          }
          <Button  type="primary" className="common-box" onClick={this.search.bind(this, this.state.filterObj, this.payType)}>查询</Button>

          <a href="javascript:;" onClick={this.props.showModal}>导出</a>
        </div>
        <div>
          <Radio.Group defaultValue="post" buttonStyle="solid" className="common-box" onChange={this.payTypeChange}>
            <Radio.Button value="post">后付费</Radio.Button>
            <Radio.Button value="pre">预付费</Radio.Button>
          </Radio.Group>
          {(() => {
            if (this.state.PayType == 'pre' && this.props.showHideTip) {
              return (
                <Checkbox onChange={this.props.hideZeroOrder}>隐藏0元订单</Checkbox>
              );
            }
          })()}
        </div>
      </div>
    );
  }
}

export default Filter;