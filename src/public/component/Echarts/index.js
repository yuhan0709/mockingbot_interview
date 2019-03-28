/**
 * Echarts组件
 * 为节省空间，只引入了echarts主模块，在使用时根据需求自行引入图表、工具栏等组件
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import echarts from 'echarts/lib/echarts';

class Echarts extends PureComponent {
  chart = null
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.chartRef) this.chart = echarts.init(this.chartRef);
    if (this.chart && this.props.options !== nextProps.options) {
      this.chart.setOption(nextProps.options);
    }
  }
  getChart = (ref) => {
    if (ref) {
      this.chartRef = ref;
      this.chart = echarts.init(ref);
      this.chart.setOption(this.props.options);
    }
  }
  render() {
    return (
      <div ref={this.getChart} style={this.props.containerStyle}></div>
    );
  }
}
Echarts.propTypes = {
  options: PropTypes.object,
  containerStyle: PropTypes.object
};
Echarts.defaultProps = {
  options: {},
  containerStyle: {
    width: '300px',
    height: '200px'
  }
};
export default Echarts;
