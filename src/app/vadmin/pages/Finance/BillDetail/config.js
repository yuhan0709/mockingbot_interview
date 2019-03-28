import moment from 'moment';
import React from 'react';
import { renderSpec } from '../OrderDetail/config';
export const detailHeaderRows = [
  [{ label: { span: 2, content: '产品名称:' }, value: { span: 8, content: '' } }],
  [{ label: { span: 2, content: '实例ID:' }, value: { span: 12, content: '' } }],
  [{ label: { span: 2, content: '发生时间:' }, value: { span: 12, content: '' } }],
  [
    { label: { span: 2, content: '账单金额:' }, value: { span: 3, content: '' } },
    { label: { span: 2, content: '支付状态:' }, value: { span: 3, content: '' } },
  ]
];
export const ecsHeaderRows = [
  [{ label: { span: 2, content: '产品名称:' }, value: { span: 8, content: '' } }],
  [{ label: { span: 2, content: '发生时间:' }, value: { span: 12, content: '' } }],
  [
    { label: { span: 2, content: '账单金额:' }, value: { span: 3, content: '' } },
    { label: { span: 2, content: '支付状态:' }, value: { span: 3, content: '' } },
  ]
];

export const headerTitle = '账单概要';
export const tableTitle = '账单详情';
const timeFormat = 'YYYY-MM-DD HH:mm:ss';
const unitMap = {
  CDN: 'Mbps',
  Storage: 'GB',
  Transcode: 'min',
  vm: '',
  volume: 'GB/每天'
};
export function getTimeRangeString(_, data, _2, needBr = true) {
  const {
    BeginTime = 0,
    EndTime = 0,
  } = data;
  return <span>{moment.unix(BeginTime).format(timeFormat)} ~{needBr ? <br/> : null} {moment.unix(EndTime).format(timeFormat)}</span>;
}
function formatCount(count) {
  return (+count).toFixed(2);
}
function formatAmount(number) {
  return `${(+number).toFixed(2)}元`;
}
function formatPrice(price, rowData) {
  const unit = unitMap[rowData.Category] || unitMap[rowData.SubCategory];
  if (unit) return `${price}元/${unit}`;
  return `${price}元`;
}
const commonTable = {
  columns: [{
    title: '账单时间',
    key: 'BillTime',
    width: 256,
    render: getTimeRangeString
  }, {
    title: '计费类型',
    dataIndex: 'SubCategoryCN',
    key: 'SubCategoryCN',
  }, {
    title: '计费方式',
    dataIndex: 'BillingMethodCN',
    key: 'BillingMethodCN',
  }, {
    title: '单价',
    dataIndex: 'Price',
    key: 'Price',
    render: formatPrice
  }, {
    title: '用量',
    dataIndex: 'Count',
    key: 'Count',
    render: formatCount
  }, {
    title: '账单金额',
    dataIndex: 'Amount',
    key: 'Amount',
    render: formatAmount
  }],
  rowKey: 'Id'
};
const transcodeTable = {
  columns: [{
    title: '账单时间',
    key: 'BillTime',
    width: 256,
    render: getTimeRangeString
  }, {
    title: '计费类型',
    dataIndex: 'SubCategoryCN',
    key: 'SubCategoryCN',
  }, {
    title: '计费方式',
    dataIndex: 'BillingMethodCN',
    key: 'BillingMethodCN',
  }, {
    title: '转码类型',
    dataIndex: 'Codec',
    key: 'Codec',
  }, {
    title: '规格梯度',
    dataIndex: 'Definition',
    key: 'Definition',
    render(Definition) {
      if (isNaN(Definition)) return Definition;
      if (Definition === -1) return '转封装';
      if (Definition === 2000) return '2K';
      if (Definition === 4000) return '4K';
      if (Definition > 4000) return '4K以上';
      return `${Definition}P`;
    }
  }, {
    title: '单价',
    dataIndex: 'Price',
    key: 'Price',
    render: formatPrice
  }, {
    title: '用量',
    dataIndex: 'Count',
    key: 'Count',
    render: formatCount
  }, {
    title: '账单金额',
    dataIndex: 'Amount',
    key: 'Amount',
    render: formatAmount
  }],
  rowKey: 'Id'
};
// function renderECSPrice(Metrologies = []) {
//   let price, unit;
//   Metrologies.forEach(metro => {
//     if (metro.Key === 'price') price = metro.Value;
//     if (metro.Key === 'unit') unit = metro.DisplayName;
//   });
//   if (unit) return `${price}${unit}`;
//   return `${price}元`;
// }
// const vmTable = {
//   columns: [{
//     title: '账单时间',
//     key: 'BillTime',
//     width: 256,
//     render: getTimeRangeString
//   }, {
//     title: '实例ID',
//     dataIndex: 'InstanceId',
//     key: 'InstanceId',
//   }, {
//     title: '配置',
//     key: 'Spec',
//     dataIndex: 'Spec',
//     render: renderSpec
//   }, {
//     title: '单价',
//     dataIndex: 'Metrologies',
//     key: 'Metrologies',
//     render: renderECSPrice,
//   }, {
//     title: '账单金额',
//     dataIndex: 'Amount',
//     key: 'Amount',
//     render: formatAmount
//   }],
//   rowKey: 'Id'
// };
const tceTable = {
  columns: [
    {
      title: '发生时间',
      key: 'BillTime',
      width: 256,
      render: getTimeRangeString
    }, {
      title: '配置',
      key: 'Spec',
      dataIndex: 'Spec',
      render: renderSpec
    }, {
      title: '单价',
      dataIndex: 'Prices',
      key: 'Prices',
      render(prices) {
        return <div>
          {Object.keys(prices).map(key => (<div key={key}>
            {key} : {prices[key]}
          </div>))}
        </div>;
      }
    }, {
      title: '用量',
      dataIndex: 'Count',
      key: 'Count',
    }, {
      title: '应付金额',
      dataIndex: 'Amount',
      key: 'Amount',
      render: formatAmount
    }
  ],
  rowKey: 'Id'
};
const rtcTable = (_, config) => {
  return {
    columns: [
      {
        title: '发生时间',
        key: 'BillTime',
        width: 256,
        render: getTimeRangeString
      }, {
        title: '配置',
        key: 'Metrologies',
        dataIndex: 'Metrologies',
        width: 250,
        render: (metrology, record) => {
          if (record.service === 'rtc') {
            const definitionMap = {
              'SD': '720p及以下',
              'HD': '720p以上'
            };
            return Object.keys(metrology).map(key => {
              let [_, region, definition ] = key.split('|');
              console.log(_);
              return <div key={key}>
                <div>地区：{config.Region[region] ? config.Region[region] : region}</div>
                {metrology[key].Func === 'Simple' && <div>计费法：按量月结</div>}
                {definition && <div>转码规格阶梯：{definitionMap[definition]}</div>}
              </div>;
            });
          }
          return '';
        }
      }, {
        title: '单价',
        dataIndex: 'Prices',
        key: 'Prices',
        render(prices, record) {
          if (prices) {
            return <div>
              {Object.keys(prices).map(key => (<div key={key}>
                {key} : {prices[key]}
              </div>))}
            </div>;
          } else {
            return record.Price + config.CommonService2[record.service].columns[record.SubCategory].unit;
          }
        }
      }, {
        title: '用量',
        dataIndex: 'Count',
        key: 'Count',
      }, {
        title: '应付金额',
        dataIndex: 'Amount',
        key: 'Amount',
        render: formatAmount
      }
    ],
    rowKey: 'Id'
  };
};
const DigitalCommonServiceTable = (_, config) => {
  return {
    columns: [{
      title: '发生时间',
      key: 'BillTime',
      width: 200,
      render: getTimeRangeString
    }, {
      title: '配置',
      key: 'Metrology',
      dataIndex: 'Metrology',
      width: 300,
      render(val) {
        const json = JSON.parse(val);
        const map = {
          Region(region) {
            return <span>
                地区：{config.Region[region] ? config.Region[region] : region}
              <br />
            </span>;
          },
          Az(az) {
            const region = json.Region;
            let value = '';
            if (region && config.RegionAZ[region]) {
              value = config.RegionAZ[region][az] ? config.RegionAZ[region][az] : az;
            } else {
              value = config.AZ[az] ? config.AZ[az] : az;
            }
            return <span>
              可用区: {value}
              <br />
            </span>;
          },
          Flavor: () => '',
          Price: () => '',
          Unit: () => ''
        };
        if (Object.prototype.toString.call(json) !== '[object Object]') {
          return '';
        }
        return <div>{
          Object.keys(json).map(key => {
            if (map[key]) {
              return map[key](json[key]);
            } else {
              return <span>
                {key} : {json[key]}
                <br />
              </span>;
            }
          })
        }</div>;
      }
    }, {
      title: '单价',
      dataIndex: 'Metrologies',
      key: 'Metrologies',
      width: 200,
      render: (ms, record) => {
        const unit = ms.Unit ? ms.Unit : (config.DigitalCommonService[record.Category] ? config.DigitalCommonService[record.Category].unit2 : '');
        const period = record.Period ? (config.DigitalCommonService[record.Category] && config.DigitalCommonService[record.Category].unit[record.Period] ? '/' + config.DigitalCommonService[record.Category].unit[record.Period] : '') : '';
        const price = ms.Price ? ms.Price : null;
        if (!price) {
          return '';
        }
        if (!price.Func) {
          return price + unit + period;
        }
        if (price.Func === 'simple') {
          return price.Value + unit + period;
        } else {
          const type = {
            tier2: '分段定价',
            tier1: '分段累计'
          };
          return <div>
            <span>类型：{type[price.Func]}</span><br />
            <span>梯度：{price.Interval}</span><br />
            <span>价格：{price.Value + unit + period}</span>
          </div>;
        }
      },
    }, {
      title: '用量',
      dataIndex: 'Count',
      key: 'Count',
      render: formatCount,
      width: 200,
    }, {
      title: '应付金额',
      dataIndex: 'Amount',
      key: 'Amount',
      width: 200,
      render: formatAmount
    }],
    rowKey: 'Id'
  };
};
// const volumeTable = {
//   columns: [{
//     title: '账单时间',
//     key: 'BillTime',
//     width: 256,
//     render: getTimeRangeString
//   }, {
//     title: '实例ID',
//     dataIndex: 'InstanceId',
//     key: 'InstanceId',
//   }, {
//     title: '单价',
//     dataIndex: 'Metrologies',
//     key: 'Metrologies',
//     render: renderECSPrice
//   }, {
//     title: '配置',
//     key: 'Spec',
//     dataIndex: 'Spec',
//     render: renderSpec
//   }, {
//     title: '账单金额',
//     dataIndex: 'Amount',
//     key: 'Amount',
//     render: formatAmount
//   }],
//   rowKey: 'Id'
// };

// const tosTable = function(measure, config) {
//   const columnsBefore = [{
//     title: '账单时间',
//     key: 'BillTime',
//     width: 256,
//     render: getTimeRangeString
//   }];
//   const columnsAfter = [
//     {
//       title: '单价',
//       dataIndex: 'Metrologies',
//       key: 'Metrologies',
//       width: 300,
//       render: (ms, record) => {
//         const unit = ms.Unit ? ms.Unit : config.DigitalCommonService.tos.unit2;
//         const period = record.Period ? (config.DigitalCommonService.tos.unit[record.Period] ? '/' + config.DigitalCommonService.tos.unit[record.Period] : '') : '';
//         const price = ms.Price ? ms.Price : null;
//         if (!price) {
//           return '';
//         }
//         if (!price.Func) {
//           return price + unit + period;
//         }
//         if (price.Func === 'simple') {
//           return price.Value + unit + period;
//         } else {
//           const type = {
//             tier2: '分段定价',
//             tier1: '分段累计'
//           };
//           return <div>
//             <span>类型：{type[price.Func]}</span><br />
//             <span>梯度：{price.Interval}</span><br />
//             <span>价格：{price.Value + unit + period}</span>
//           </div>;
//         }
//       }
//     }, {
//       title: '用量',
//       dataIndex: 'Count',
//       key: 'Count',
//       width: 200,
//       render: (count,record) => {
//         return formatCount(count) + (config.CommonService[record.service] ? (config.CommonService[record.service].spec ? config.CommonService[record.service].spec[record.Category].unit : '') : '');
//       },
//     }, {
//       title: '应付金额',
//       dataIndex: 'Amount',
//       key: 'Amount',
//       width: 200,
//       render: formatAmount
//     }
//   ];
//   const columns = [];
//   if (measure.region) {
//     columns.push({
//       title: '地区',
//       dataIndex: 'region',
//       key: 'region',
//       width: 200,
//       render: region => config.Region[region] ? config.Region[region] : region
//     });
//   }
//   return {
//     columns: [...columnsBefore, ...columns, ...columnsAfter],
//     rowKey: 'Id'
//   };
// };

const tableMap = {
  CDN: commonTable,
  Storage: commonTable,
  Transcode: transcodeTable,
  // vm: vmTable,
  // volume: volumeTable,
  tce: tceTable,
  //tos: tosTable,
  rtc: rtcTable
};
export function getTable(Category, ProductGroupId, measure, config) {

  if (tableMap[ProductGroupId]) {
    if (typeof tableMap[ProductGroupId] === 'function') {
      return tableMap[ProductGroupId](measure, config);
    } else {
      return tableMap[ProductGroupId];
    }
  }
  if (config.DigitalCommonService[measure.Category] || config.DigitalCommonService[measure.service]) {
    return DigitalCommonServiceTable(measure, config);
  }
  return tableMap[Category] || commonTable;
}