import React from 'react';
import {
  Chart,
  Geom,
  Axis,
  Tooltip,
  Legend,
  Guide
} from 'bizcharts';
import { Alert } from 'antd';
import moment from 'moment/moment';
import { genFormatTooltip, defaultTooltipTpl, scale, chartValid,format } from './util';
import PropTypes from 'prop-types';
import formatValue,{ formatByteFromMax, Gb } from '../../../util/valueFormat';

const { Line, DataMarker } = Guide;

class BizLineChart extends React.Component {
  state = {
    hiddenVender: {}
  }
  chart = null;
  static propTypes = {
    data: PropTypes.array,
    type: PropTypes.string,
    maxPeak: PropTypes.number,
    peak95Arr: PropTypes.array,
    maxNodes: PropTypes.array,
    showLegend: PropTypes.bool,
    xAxisFormat: PropTypes.string,
    TooltipProps: PropTypes.object,
  }
  static defaultProps = {
    data: [],
    type: 'bandwidth',
    maxPeak: 0,
    peak95Arr: [],
    maxNodes: [],
    showLegend: true,
    xAxisFormat: 'YYYY-MM-DD',
    TooltipProps: {
      showTitle: false,
      itemTpl: defaultTooltipTpl
    }
  }

  getG2Instance = (chart) => {
    if (this.props.type === 'bandwidth'){
      const hiddenVender = { ...this.state.hiddenVender };
      chart.on('legend-item:click', ev => {
        // 点击图例项，获取激活状态
        const checked = ev.target._cfg.checked;
        const { dataValue } = ev.data;
        if (checked === false) {
          console.log('隐藏');
          hiddenVender[dataValue] = true;
        } else {
          console.log('还原');
          hiddenVender[dataValue] = false;
        }

        this.setState({
          hiddenVender
        });
      });
    }

    this.chart = chart;
  }

  render() {
    const { data, type, showLegend, xAxisFormat, TooltipProps, maxPeak, peak95Arr, maxNodes, start, end } = this.props;
    const formatTooltip = genFormatTooltip(type);
    return (
      <div>
        {chartValid(data) ?
          <Chart scale={scale} height={500} data={data} padding={[50, 110, 160, 120]} forceFit
            onGetG2Instance={this.getG2Instance}>
            <Legend visible={showLegend}/>
            <Axis
              name="Value"
              label={{
                formatter: val => {
                  // 根据类型格式化
                  return format(type,val,maxPeak);
                }
              }}
            />
            <Axis
              name="Timestamp"
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
              {...TooltipProps}
            />
            <Geom
              type="line"
              position="Timestamp*Value"
              size={2}
              color={'Vender'}
              tooltip={['Timestamp*Value*Vender*Detail', formatTooltip]}
              shape='smooth'
            />
            {type === 'bandwidth' ? <Guide>
              {/*95线*/}
              {peak95Arr.map((item, index) => {
                const max95 = item.Peak95;
                const options = {
                  top: true,
                  start: [start.Timestamp, max95],
                  end: [end.Timestamp, max95],
                  text: {
                    position: index < 10 ? index * 0.1 : 'end',
                    content: `${type === 'bandwidth' ? formatValue(max95) + 'bps' : formatByteFromMax(Gb, max95)}`,
                    style: {
                      fontSize: 15,
                      fill: 'black',
                      fontWeigt: 800
                    }
                  },
                  appendInfo: {
                    id: item.Vender
                  }
                };
                return this.state.hiddenVender[item.Vender] ? null : <Line
                  key={item.Vender}
                  {...options}
                />;
              })}
              {/*峰值点*/}
              {maxNodes.map(maxNode => {
                const pointOptions = {
                  top: true,
                  position: [maxNode.Timestamp, maxNode.Value],
                  lineLength: 0,
                  appendInfo: {
                    id: maxNode.Vender
                  }
                };
                return this.state.hiddenVender[maxNode.Vender] ? null : <DataMarker
                  key={maxNode.Vender}
                  {...pointOptions}
                />;
              })}
            </Guide> : null}
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
