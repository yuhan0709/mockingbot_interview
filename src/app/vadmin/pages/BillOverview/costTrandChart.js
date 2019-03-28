import React, { PureComponent } from 'react';
import moment from 'moment';
import { formatCostValue, htmlContent } from './util';
import LineChart from './component/BizLineChart';

const TooltipProps = { htmlContent };
export default class CostRateCharts extends PureComponent {
  static getChartDataFromProps(props) {
    const chartData = [];
    props.costData.forEach(cost =>{
      Object.keys(cost.MonthlyCost).forEach(month => {
        chartData.push({ Key: cost.title || cost.ServiceTree, Value: +cost.MonthlyCost[month].toFixed(2), Timestamp: moment(month).startOf('month').valueOf() });
      });
    });
    return chartData;
  }
  static getDerivedStateFromProps(props, state) {
    if (props !== state.preProps) {
      const chartData = CostRateCharts.getChartDataFromProps(props);
      return {
        ...state,
        chartData,
      };
    }
    return state;
  }
  state = {
    preProps: this.props,
    chartData: CostRateCharts.getChartDataFromProps(this.props),
  }
  render() {
    return (<LineChart
      data={this.state.chartData}
      format={formatCostValue}
      xAxisFormat="YYYY-MM"
      scaleType="timeCat"
      TooltipProps={TooltipProps}
      scale={this.props.scale}
    />);
  }
}