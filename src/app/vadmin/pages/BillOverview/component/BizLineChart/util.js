import moment from 'moment';

const K = 1000;
const M = 1000000;
const G = 1000000000;
// 格式化数值
export default function formatValue(value = 0, fix = 2, max) {
  const standard = max ? max : value;
  if (standard < K) return value.toFixed(fix);
  if (standard < M) return `${(value / K).toFixed(fix)}K`;
  if (standard < G) return `${(value / M).toFixed(fix)}M`;
  return `${(value / G).toFixed(fix)}G`;
}

const Second = 1000;
// const Minute = 60 * Second;
// const Hour = 60 * Minute;
// const Day = 24 * Hour;

// 格式化时间
export function formatTime(value = 0, fix = 2, max) {
  const standard = max ? max : value;
  if (standard < Second) return `${value.toFixed(fix)}ms`;
  // if (standard < Minute) return `${(value / Second).toFixed(fix)}s`;
  // if (standard < Hour) return `${(value / Minute).toFixed(fix)}min`;
  // if (standard < Day) return `${(value / Day).toFixed(fix)}h`;
  // return `${(value / Day).toFixed(fix)}d`;
  return `${(value / Second).toFixed(fix)}s`;
}

// 格式化科学计数法
export function formatScientificNotation(value = 0, fix = 2, max) {
  const standard = max ? max : value;
  const num = Math.floor(Math.log10(standard));
  return value === 0 || num === 0 ? value.toFixed(fix) : `${(value / Math.pow(10,num)).toFixed(fix)} x 10^${num}`;
}

export const format = (type = 'count', number = 0, max = 0) => {
  number = parseFloat(number);
  switch (type) {
  case 'percent':
    return formatValue(number, 4) + '%';
  case 'time':
    return formatTime(number, 2, max);
  case 'count':
    return formatScientificNotation(number);
  default:
    return formatValue(number, 2, max);
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

export const genFormatTooltip = (type, fromatFunc = format) => (Timestamp, Value, Key,Detail) => {
  return {
    Value: Number.isNaN(Value) || Value == null ? '暂无数据' : fromatFunc(type, Value),
    Key,
    value: Value,
    Detail
  };
};
export function htmlContent(title, items) {
  let html = '<div class="g2-tooltip">';
  let titleDom = '<div class="g2-tooltip-title" style="margin-bottom: 4px;">' + moment(title).format('YYYY-MM-DD') + '</div>';
  let listDom = '<ul class="g2-tooltip-list">';

  items.sort((a, b) => b.value - a.value);
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    const { Key, Value,Detail,index, color } = item;
    let itemDom = `<li data-index=${index}>
      <span style="background-color:${color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>
      ${Key}：${Value}
      </li>`;
    listDom += itemDom;
    if (Detail){
      const detailDom = `<div><span style="background-color:black;width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;box-shadow: 0px 0px 2px 5px rgba(0,0,0,.2);"></span>${Detail}</div>`;
      listDom += detailDom;
    }
  }

  listDom += '</ul>';
  return html + titleDom + listDom + '</div>';
}

// 图表数据有效
export function chartValid(data) {
  return data.length > 0 && !data.every(e => e.Value == null);
}