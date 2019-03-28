import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Radio, DatePicker } from 'antd';
import moment from 'moment';
import style from './style.less';
import { getZeroTime } from './util';

const { RangePicker } = DatePicker;

class TimeRange extends Component {
  clickConfirmButton = false;

  constructor(props) {
    super(props);
    this.state = {
      time: 'today',
      timeRange: [],
      oldTimeRange: []
    };
  }

  componentDidMount() {
    this.setState({
      timeRange: this.props.defaultRange
    });
    this.props.onTimeRangeChange(this.props.defaultRange);
  }

  toggleTime = (e) => {
    const time = e.target.value;
    this.setState({ time });
    // 联动日期选择框
    this.timeControlRange(time);
  }

  timeControlRange = (time) => {
    const zeroTime = getZeroTime(moment());
    let timeRange = [...this.state.timeRange];
    switch (time) {
    case 'today':
      // 今日0点到当前时刻
      timeRange = [zeroTime, moment()];
      break;
    case 'yesterday':
      // 昨天0点到23:59
      timeRange = [getZeroTime(moment().subtract(1, 'days')), zeroTime.subtract(1, 'seconds')];
      break;
    case 'week':
      // 当前时刻往前算7天
      timeRange = [moment().subtract(7, 'days'), moment()];
      break;
    case 'month':
      // 当前时刻往前算30天
      timeRange = [moment().subtract(30, 'days'), moment()];
      break;
    default:
      return;
    }
    this.setState({
      timeRange
    });
    this.props.onTimeRangeChange(timeRange);
  }

  timeRangeChange = (timeRange) => {
    this.setState({
      timeRange
    });
    // 点了取消按钮
    if (timeRange.length === 0){
      this.props.onTimeRangeChange(timeRange);
    }
  }

  openTimeRange = (open) => {
    if (open || this.clickConfirmButton) {
      const oldTimeRange = [...this.state.timeRange];
      this.setState({
        oldTimeRange
      });
      this.clickConfirmButton = false;
    } else {
      console.log('重置时间选择框');
      this.setState({
        timeRange: this.state.oldTimeRange
      });
    }
  }

  customTime = (range) => {
    // 看来 onOk 事件触发时机先于打开关闭日历框
    this.props.onTimeRangeChange(range);
    this.clickConfirmButton = true;
    this.setState({
      timeRange: range
    });

    let time = this.state.time;
    const zeroTime = getZeroTime(moment());
    // 暂不考虑反向联动
    if (range[0].isSame(zeroTime) && range[1].isSame(moment())) {
      time = 'today';
    } else if (zeroTime === 0) {
      time = 'yesterday';
    } else if (zeroTime === 0) {
      time = 'week';
    } else if (zeroTime === 0) {
      time = 'month';
    } else {
      time = 'custom';
    }
    this.setState({
      time
    });
  }

  render() {
    return (
      <div className={style.timeRange}>
        {this.props.showButtons ? <Radio.Group value={this.state.time} onChange={this.toggleTime} buttonStyle="solid"
          style={{ marginBottom: 16 }}>
          <Radio.Button value="today">今天</Radio.Button>
          <Radio.Button value="yesterday">昨天</Radio.Button>
          <Radio.Button value="week">近7天</Radio.Button>
          <Radio.Button value="month">近30天</Radio.Button>
        </Radio.Group> : null}
        <RangePicker
          {...this.props.rangePickerProps}
          value={this.state.timeRange}
          showTime={{
            hideDisabledOptions: true,
            defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
          }}
          format="YYYY-MM-DD HH:mm:ss"
          onOk={this.customTime}
          onChange={this.timeRangeChange}
          onOpenChange={this.openTimeRange}
        />
      </div>
    );
  }
}

TimeRange.defaultProps = {
  onTimeRangeChange: () => {
  },
  showButtons: true,
  defaultRange: [getZeroTime(moment()), moment()],
  rangePickerProps: {}
};

TimeRange.propTypes = {
  onTimeRangeChange: PropTypes.func,
  showButtons: PropTypes.bool,
  defaultRange: PropTypes.array,
  rangePickerProps: PropTypes.object
};

export default TimeRange;