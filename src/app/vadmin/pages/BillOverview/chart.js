import React from 'react';
import G2Chart from '@component/G2Chart';
import PropTypes from 'prop-types';
import { Alert } from 'antd';

export default class Chart extends React.Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
      item: PropTypes.string,
      value: PropTypes.number
    }))
  }
  static defaultProps = {
    data: []
  }
  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data;
  }
  getChartProps() {
    const data = [ ...this.props.data ];
    const operation = chart => {
      chart.coord('theta', { radius: 0.8, innerRadius: 0.6 });
      chart.tooltip({
        showTitle: false,
        itemTpl: '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
      });
      chart.legend(true,{
        position: "bottom-center", 
        itemGap: 25
      })
      chart.intervalStack().position('value').color('item').label('value', {
        formatter: function formatter(value, item) {
          return item.point.item + ': ' + value;
        }
      }).tooltip('item*value', function(item, value) {
        return {
          name: item,
          value: value
        };
      }).style({
        lineWidth: 1,
        stroke: '#fff'
      });
    };
    const options = {
      value: {
        formatter(val) {
          return (+val).toFixed(2);
        }
      }
    };
    return {
      data,
      operation,
      options
    };
  }
  render() {
    const {
      data,
      operation,
      options
    } = this.getChartProps();

    if (!data || data.length === 0) {
      return <Alert
        style={{ 'marginBottom': '40px' }}
        message="暂无图表数据"
        type="warning"
        showIcon/>;
    }

    return (
      <div>
        <G2Chart
          data={data}
          operation={operation}
          options={options}
          chartOptions={{
            height: 400
          }}
          containerStyle = {{
            width: '100%',
            height: '400px'
          }}
        />
      </div>
    );
  }
}