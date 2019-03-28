import formatValue, { formatByte, formatByteFromMax, formatValueFromMax, Gb } from '../../../util/valueFormat';
import moment from 'moment/moment';

export const format = (type = 'count', val = 0,max) => {
  switch (type) {
  case 'bandwidth':
    return formatValueFromMax(max, +val) + 'bps';
  default:
    return formatByte(+val, 2);
  }
};
export const scale = {
  Timestamp: {
    alias: '时间',
    type: 'time',
    mask: 'YYYY-MM-DD HH:mm:ss',
    nice: false,
    tickCount: 5
  },
  type: {
    type: 'cat'
  }
};

export const defaultTooltipTpl =  `<li data-index={index}>
      <span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>
      {Vender} {Timestamp} {Value} 
      </li>`;

export const genFormatTooltip = type => (Timestamp, Value, Vender) => {
  return {
    Timestamp: moment(Timestamp).format('YYYY-MM-DD HH:mm:ss'),
    Value: type === 'bandwidth' ? formatValue(Value) + 'bps' : formatByteFromMax(Gb,Value),
    Vender
  };
};

// 图表数据有效
export function chartValid(data) {
  return data.length > 0 && !data.every(e => e.Value == null);
}