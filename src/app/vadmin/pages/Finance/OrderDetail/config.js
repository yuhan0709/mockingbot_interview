import React from 'react';
export const detailHeaderRows = [
  [{ label: { span: 2, content: '订单号:' }, value: { span: 8, content: '' } }],
  [
    { label: { span: 2, content: '下单时间:' }, value: { span: 6, content: '' } },
  ],
  [
    { label: { span: 2, content: '订单类型:' }, value: { span: 4, content: '' } },
    { label: { span: 2, content: '支付状态:' }, value: { span: 4, content: '' } },
  ]
];
export const ecsHeaderRows = [
  [{ label: { span: 2, content: '订单号:' }, value: { span: 8, content: '' } }],
  [
    { label: { span: 2, content: '下单时间:' }, value: { span: 6, content: '' } },
  ],
  [
    { label: { span: 2, content: '订单类型:' }, value: { span: 4, content: '' } },
    { label: { span: 2, content: '支付状态:' }, value: { span: 4, content: '' } },
  ]
];
export const headerTitle = '订单概要';
export const tableTitle = '订单详情';
const specPriority = {
  '区域': 1,
  '可用区': 2,
  '实例规格': 3,
  '镜像名称': 4,
};
export function renderSpec(Spec) {
  return Object.keys(Spec).sort((a, b) => ((specPriority[a] || 100) - (specPriority[b] || 100))).map(key => {
    return <div key={key}>{key}: {Spec[key]}</div>;
  });
}
const commonTable = {
  columns: [{
    title: '计费项',
    dataIndex: 'category',
    key: 'category',
  }, {
    title: '计费法',
    dataIndex: 'method',
    key: 'method',
  }, {
    title: '支付方式',
    render() {
      return '无需支付';
    }
  }],
  rowKey: 'method'
};
const ecsTable = {
  columns: [{
    title: '产品',
    dataIndex: 'InstanceId',
    key: 'InstanceId',
  }, {
    title: '配置',
    dataIndex: 'Spec',
    key: 'Spec',
    render: renderSpec
  }, {
    title: '付费方式',
    key: 'PayTypeCN',
    dataIndex: 'PayTypeCN'
  }, {
    title: '金额(元)',
    key: 'PayAmount',
    dataIndex: 'PayAmount',
    render(number) {
      return `${(+number).toFixed(2)}`;
    }
  }],
  rowKey: 'Id'
};
export const detailTableMap = {
  ecs: ecsTable
};
export function getDetailTable(Category) {
  return detailTableMap[Category] || commonTable;
}