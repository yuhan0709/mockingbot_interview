import React, { PureComponent } from 'react';
import RingChart from './chart';

export default class CostRateCharts extends PureComponent {
  static getChartDataFromProps(props) {
    return props.costData.map(cost => ({ item: cost.title || cost.ServiceTree, value: +cost.Cost.toFixed(2) }));
  }
  static getDerivedStateFromProps(props, state) {
    if (props !== state.preProps) {
      return {
        ...state,
        chartData: CostRateCharts.getChartDataFromProps(props)
      };
    }
    return state;
  }
  state = {
    preProps: this.props,
    chartData: CostRateCharts.getChartDataFromProps(this.props)
  }
  render() {
    return (<RingChart data={this.state.chartData} />);
  }
}