import React from 'react';
import {
  Chart,
  Axis,
  Tooltip,
  Legend,
} from 'bizcharts';
import { Alert } from 'antd';
import moment from 'moment/moment';
import { format, scale, htmlContent, chartValid } from './util';
import PropTypes from 'prop-types';

const axisLineStyle = {
  stroke: '#d9d9d9',
  lineWidth: 1,
};
const lineStyle = {
  ...axisLineStyle,
  lineDash: [4, 4]
};
class BizStackedColumnChart extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    type: PropTypes.string,
    showLegend: PropTypes.bool,
    xAxisFormat: PropTypes.string,
    TooltipProps: PropTypes.object,
    scaleType: PropTypes.string,
    scale: PropTypes.object
  }
  static defaultProps = {
    data: [],
    type: 'count',
    showLegend: true,
    xAxisFormat: 'YYYY-MM-DD',
    TooltipProps: {},
    scaleType: 'time',
  }
  render() {
    const { data, type, showLegend, xAxisFormat, TooltipProps, sort, scaleType } = this.props;
    const max = Math.max(...data.map(e => e.Value || 0));
    return (
      <div>
        {chartValid(data) ?
          <Chart scale={ this.props.scale || scale(scaleType) } height={500} data={data} padding={[50, 110, 160, 100]} forceFit>
            <Legend visible={showLegend}/>
            <Axis
              name="Value"
              grid={{
                lineStyle,
              }}
              title={{
                position: 'end',
                textStyle: {
                  rotate: '0',
                  fill: '#000',
                  fontWeight: 'bold',
                }
              }}
              line={axisLineStyle}
              tickLine={axisLineStyle}
              label={{
                formatter: val => {
                  // 根据峰值来格式化
                  return format(type, val, max);
                }
              }}
            />
            <Axis
              name="Timestamp"
              grid={{
                lineStyle,
              }}
              label={{
                formatter: val => {
                  return moment(val).format(xAxisFormat);
                }
              }}
            />
            <Tooltip
              crosshairs={{
                type: 'y',
              }}
              htmlContent={(title, items) => { return htmlContent(title, items, sort); }}
              {...TooltipProps}
            />
            {this.props.children}
          </Chart> :
          <Alert
            style={{ 'marginBottom': '40px' }}
            message="暂无图表数据"
            type="warning"
            showIcon/>
        }
      </div>
    );
  }
}

export default BizStackedColumnChart;
