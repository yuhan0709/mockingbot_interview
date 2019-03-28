import React from 'react';
import {
  Chart,
  Geom,
  Axis,
  Tooltip,
  Legend,
} from 'bizcharts';
import { Alert } from 'antd';
import moment from 'moment/moment';
import { genFormatTooltip, format, scale, htmlContent,chartValid } from './util';
import PropTypes from 'prop-types';

const axisLineStyle = {
  stroke: '#d9d9d9',
  lineWidth: 1,
};
const lineStyle = {
  ...axisLineStyle,
  lineDash: [4, 4]
};
const lineColor = [
  '#1890FF', '#41D9C7', '#2FC25B', '#FACC14', '#E6965C', '#223273', '#7564CC', '#8543E0',
  '#5C8EE6', '#13C2C2', '#5CA3E6', '#3436C7', '#B381E6', '#F04864', '#D598D9'
];
const areaColors = lineColor.map(color => `l (90) 0:${color}ff 1:${color}00`);
class BizLineChart extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    type: PropTypes.string,
    showLegend: PropTypes.bool,
    xAxisFormat: PropTypes.string,
    TooltipProps: PropTypes.object,
    format: PropTypes.func,
    scale: PropTypes.object,
  }
  static defaultProps = {
    data: [],
    type: 'count',
    showLegend: true,
    xAxisFormat: 'YYYY-MM-DD',
    TooltipProps: {},
    format,
    scale
  }
  render() {
    const { data, type, showLegend, xAxisFormat, TooltipProps } = this.props;
    const max = Math.max(...data.map(e => e.Value || 0));
    const formatTooltip = genFormatTooltip(type, this.props.format);
    return (
      <div>
        {chartValid(data) ?
          <Chart scale={this.props.scale} height={500} data={data} padding={[50, 110, showLegend ? 120 : 80, 100]} forceFit>
            <Legend 
              visible={showLegend}
              itemGap={25}
            />
            <Axis
              name="Value"
              grid={{
                lineStyle,
              }}
              title={{
                autoRotate: false,
                position: 'end',
                offset: 50,
                textStyle: {
                  fill: '#000',
                  fontWeight: 'bold',
                  textBaseline: 'bottom'
                },
              }}
              line={axisLineStyle}
              tickLine={axisLineStyle}
              label={{
                autoRotate: !(this.props.scale && this.props.scale.Value.alias),
                rotate: this.props.scale && this.props.scale.Value.alias ? -45 : 0,
                formatter: val => {
                  // 根据峰值来格式化
                   return this.props.format(type, val, max);
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
              htmlContent={htmlContent}
              {...TooltipProps}
            />
            <Geom
              type="area"
              position="Timestamp*Value"
              size={2}
              color={['Key', areaColors]}
              tooltip={false}
              shape='smooth'
            />
            <Geom
              type="line"
              position="Timestamp*Value"
              size={2}
              color={['Key', lineColor]}
              tooltip={['Timestamp*Value*Key*Detail', formatTooltip]}
              shape='smooth'
            />
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

export default BizLineChart;
