/**
 * G2 组件
 * 一个比 Echarts 更好用、更好看的图表库
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import G2 from '@antv/g2';
const G2 = window.G2;
G2.track(false);

class G2Chart extends PureComponent {
  chart = null

  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   if (this.chart && this.props.data !== nextProps.data) {
  //     this.chart.changeData(nextProps.data);
  //   }
  //   if (this.chart && (this.props.chartOptions.width !== nextProps.chartOptions.width || this.props.chartOptions.height !== nextProps.chartOptions.height)) {
  //     this.chart.changeSize(nextProps.width,nextProps.height);
  //   }
  //   if (this.chart && this.props.operation !== nextProps.operation){
  //     // this.chart.clear();
  //     nextProps.operation(this.chart);
  //     this.chart.repaint();
  //   }
  // }

  componentDidUpdate(prevProps) {
    if (this.chart && this.props.data !== prevProps.data) {
      this.chart.changeData(this.props.data);
    }
    if (this.chart && (this.props.chartOptions.width !== prevProps.chartOptions.width || this.props.chartOptions.height !== prevProps.chartOptions.height)) {
      this.chart.changeSize(this.props.width,this.props.height);
    }
    if (this.chart && this.props.operation !== prevProps.operation){
      // console.log('???');
      // this.chart.clear();
      // this.props.operation(this.chart);
      // this.chart.render();
    }
  }

  componentWillUnmount() {
    this.chart = null;
  }

  getChart = (ref) => {
    if (ref) {
      const { data, options,chartOptions } = this.props;
      const chart = new G2.Chart({
        container: ref,
        padding: 'auto',
        ...chartOptions
      });
      chart.source(data,options);
      this.props.operation(chart);
      chart.render();
      setTimeout(()=>{
        chart.changeWidth(ref.offsetWidth);
      },0);
      this.chart = chart;
    }
  }
  render() {
    return (
      <div ref={this.getChart} style={this.props.containerStyle}></div>
    );
  }
}
G2Chart.propTypes = {
  containerStyle: PropTypes.object,
  operation: PropTypes.func,
  options: PropTypes.object,
  chartOptions: PropTypes.object,
  data: PropTypes.oneOfType([PropTypes.object,PropTypes.array]),
};
G2Chart.defaultProps = {
  containerStyle: {
    marginTop: '20px',
    width: '80%',
    height: '400px'
  },
  operation: chart=>chart,
  options: {},
  chartOptions: {
    height: 400,
    plotCfg: {},
    forceFit: true
  },
  data: {},
};
export default G2Chart;