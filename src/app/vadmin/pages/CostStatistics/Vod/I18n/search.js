import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, DatePicker,Select } from 'antd';
import Request from '../../../../util/request';
import moment from 'moment';
import downloadCsv from '../../../../util/downloadCsv';
import style from '../../style.less';

const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;

const {
  ListRegions,
} = Request;

class Search extends Component {
  param = {}

  constructor(props) {
    super(props);
    this.state = {
      regions: [],
      region: '',
      vendors: [],
      vendor: ''
    };
  }

  async componentDidMount() {
    await this.init();
  }

  checkPage = async () => {
    await this.props.onSubmit(this.param);
  }

  init = async () => {
    const vendors = window.INIT_CONFIG.expenseConfig.VendorFlow || {};
    const vendor = Object.keys(window.INIT_CONFIG.expenseConfig.VendorFlow)[0];
    await this.initRegion(vendor);

    // 状态
    const region = this.state.regions[0];
    this.setState({
      vendors,
      vendor,
      region
    });

    // 参数
    this.param.Vendor = vendor;
    this.param.Region = region;
    await this.checkPage();
  }

  selectVendor = async (vendor) => {
    // 状态
    await this.initRegion(vendor);
    const region = this.state.regions[0];
    this.setState({
      vendor,
      region
    });

    // 参数
    this.param.Vendor = vendor;
    this.param.Region = region;
  }

  initRegion = async (Vendor) => {
    let { Regions } = await ListRegions({ Category: 'Flow',Vendor });
    this.setState({
      regions: Regions
    });
  }

  exportFile = async () => {
    downloadCsv('ExportFlow.csv', 'GetOverseaFlowStatistics', {
      ...this.param,
      Download: 1
    });
  }

  regionChange = (region) => {
    // 状态
    this.setState({
      region
    });
    // 参数
    this.param.Region = region;
  }

  handleTimeRangeChange = (range) => {
    if (range.length === 2) {
      this.param.BeginTime = range[0].startOf('day').toISOString();
      this.param.EndTime = moment(range[1].startOf('day')).add(1, 'day').toISOString();
    } else {
      this.param.BeginTime = this.param.EndTime = undefined;
    }
  }

  render() {
    const { vendor,vendors,region,regions } = this.state;
    return (
      <div className="common-bottom">
        <span className="common-box">
          供应商：
        </span>
        <Select value={vendor} className={style.select} onChange={this.selectVendor}>
          {Object.keys(vendors).map(e=>
            <Option key={e} value={e}>{e}</Option>
          )}
        </Select>
        <span className="common-box">
          地区：
        </span>
        <Select value={region} className={style.select} onChange={this.regionChange}>
          {regions.map(e=>
            <Option key={e} value={e}>{e}</Option>
          )}
        </Select>
        <span className="common-box">
          时间选择：
        </span>
        <RangePicker className="common-box" showTime onChange={this.handleTimeRangeChange}/>

        <Button className="common-box" style={{ marginRight: '10px' }} onClick={this.checkPage}>查询</Button>
        <Button className="common-box" onClick={this.exportFile}>导出</Button>
      </div>
    );
  }
}

Search.defaultProps = {
  onSubmit: (param) => {
    console.log(param);
  }
};

Search.propTypes = {
  onSubmit: PropTypes.func
};

export default Search;