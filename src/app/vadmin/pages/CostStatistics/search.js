import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TreeSelect, Button, DatePicker } from 'antd';
import { treeProps } from './util';
import Request from '../../util/request';
import moment from 'moment';
import downloadCsv from '../../util/downloadCsv';

const RangePicker = DatePicker.RangePicker;

const {
  ListRegions
} = Request;

class Search extends Component {
  param = {}

  constructor(props) {
    super(props);
    this.state = {
      regions: []
    };
  }

  async componentDidMount() {
    await this.initRegion();
    await this.checkPage();
  }

  checkPage = async () => {
    await this.props.onSubmit(this.param);
  }

  initRegion = async () => {
    let regions = [{
      title: '全部',
      value: '全部',
      key: '全部',
    }];
    let { Regions } = await ListRegions({ Category: this.props.type });
    Regions = Regions.map(r => {
      return {
        title: r,
        value: r,
        key: r,
      };
    });
    regions[0].children = Regions;
    this.setState({
      regions
    });
  }

  exportFile = async () => {
    downloadCsv(`Export${this.props.type}.csv`, this.props.exportFunc, {
      ...this.param,
      Download: 1
    });
  }

  regionChange = (regionValue) => {
    if (regionValue[0] !== '全部') {
      this.param.Region = regionValue.join(',');
    } else {
      this.param.Region = undefined;
    }
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
    const regionProps = {
      treeData: this.state.regions,
      defaultValue: [],
      onChange: this.regionChange,
      searchPlaceholder: '请选择地区'
    };
    return (
      <div className="common-bottom">
        <span className="common-box">
          地区：
        </span>
        <TreeSelect {...treeProps} {...regionProps}/>
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
  type: 'Bandwidth',
  onSubmit: (param) => {
    console.log(param);
  },
  exportFunc: ''
};

Search.propTypes = {
  type: PropTypes.oneOf(['Bandwidth', 'Storage','LiveBandwidth']),
  onSubmit: PropTypes.func,
  exportFunc: PropTypes.string,
};

export default Search;