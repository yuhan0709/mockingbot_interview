import React from 'react';
import {
  Geom,
} from 'bizcharts';
import BizChart from '../BizChart';
import { genFormatTooltip } from '../BizChart/util';
import PropTypes from 'prop-types';

class BizStackedColumnChart extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    type: PropTypes.string,
    showLegend: PropTypes.bool,
    xAxisFormat: PropTypes.string,
    TooltipProps: PropTypes.object,
    format: PropTypes.func
  }
  static defaultProps = {
    data: [],
    type: 'count',
    showLegend: true,
    xAxisFormat: 'YYYY-MM-DD',
    TooltipProps: {}
  }
  render() {
    const { type, format } = this.props;
    const formatTooltip = genFormatTooltip(type, format);
    return (
      <BizChart {...this.props}>
        <Geom
          type="intervalStack"
          position="Timestamp*Value"
          color={'Key'}
          tooltip={['Timestamp*Value*Key*Detail', formatTooltip]}
          shape='smooth'
        />
      </BizChart>
    );
  }
}

export default BizStackedColumnChart;