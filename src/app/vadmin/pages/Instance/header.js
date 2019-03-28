import React, { Component } from 'react';
import { Button } from 'antd';
import TimeRange from '../../component/TimeRange';
// import AutoComplete from '../../component/AutoComplete';
import { Input } from 'antd';
import PropTypes from 'prop-types';

export default class InstanceHeader extends Component {
  Service = []
  static propTypes = {
    onSearch: PropTypes.func,
  }
  static defaultProps = {
    onSearch: () => {
    },
  }

  param = {
  };

  constructor(props) {
    super(props);
    if (window.INIT_CONFIG && window.INIT_CONFIG.expenseConfig) {
      const Service = window.INIT_CONFIG.expenseConfig.Service;
      Object.keys(Service).forEach(key => {
        this.Service.push({
          name: key,
          text: Service[key]
        });
      });
    }
  }

  handleTimeRange = (range) => {
    if (range.length === 2) {
      this.param.BeginTime = range[0].toISOString();
      this.param.EndTime = range[1].toISOString();
    } else {
      this.param.BeginTime = this.param.EndTime = undefined;
    }
  }

  selectService = (value) => {
    this.param.Services = value;
  }

  searchUser = (e) => {
    const value = e.target.value;
    this.param.AccountIds = value;
  }

  search = () => {
    if (this.param.AccountIds === '') this.param.AccountIds = undefined;
    if (this.param.Services === '') this.param.Services = undefined;
    this.props.onSearch(this.param);
  }

  render() {
    return (
      <div className="common-bottom">
        <div>
        日期:


          {/* <Select
            defaultValue=""
            showSearch
            style={{ width: '110px' }}
            placeholder="请选择产品"
            optionFilterProp="children"
            onChange={this.selectService}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            <Option value="">全部</Option>
            {this.Service.map(s => {
              return <Option key={s.name} value={s.name}>{s.text}</Option>;
            })}
          </Select> */}
          <div className="common-box" style={{ marginLeft: '-7px' }}>
            <TimeRange  defaultRange={[]}
              onTimeRangeChange={this.handleTimeRange} showButtons={false}></TimeRange>
          </div>

          {/*<AutoComplete/>*/}
          <span>
            <span className="common-box">用户ID:</span>
            <Input
              className="common-box"
              placeholder="请输入用户ID进行搜索"
              onChange={this.searchUser}
              // onSearch={this.search}
              style={{ width: 200 }}
            />
          </span>
          <Button type="primary" className="common-box" onClick={this.search}>
            查询
          </Button>
        </div>
      </div>
    );
  }
}

