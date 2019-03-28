import React from 'react';
import Link from '@component/Link';
import moment from 'moment';

function configMap(key, value) {
  return window.INIT_CONFIG.expenseConfig[key][value] || value;
}
const ConfigMapValue = new Proxy({}, {
  get(_, key) {
    return function(value) {
      return configMap(key, value);
    };
  }
});
const expenseConfig = window.INIT_CONFIG.expenseConfig;

//const origin = location.origin;
export const vcloudHome = 'https://vcloud.bytedance.com/';

export function stdMoney(amount) {
  return `￥${(+amount).toFixed(2)}`;
}
function stdTime(time) {
  return moment.unix(time).format('YYYY-MM-DD HH:mm:ss');
}
export function stdTimeMonth(time) {
  return moment.unix(time).format('YYYY-MM');
}
export function stdTimeRangeDaily(_, rowData, _2, needBr = true) {
  return <span>{stdTime(rowData.BeginTime)} ~{needBr ? <br/> : null} {stdTime(rowData.EndTime)}</span>;
}
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
function hideId(id) {
  // return id.replace(/.{4}$/, '****');
  return id;
}
function stdServiceName(Service) {
  return `${Service}(${ConfigMapValue.Service(Service)})`;
}

export function stdTranscodeDefinition(Definition) {
  if (isNaN(Definition)) return Definition;
  if (Definition === -1) return '转封装';
  if (Definition === 2000) return '2K';
  if (Definition === 4000) return '4K';
  if (Definition > 4000) return '4K以上';
  return `${Definition}P`;
}

export const BillSummaryColumns = function(callback, getData) {
  return [
    {
      title: '用户名',
      dataIndex: 'Identity',
      key: 'Identity'
    },
    {
      title: '产品名称',
      dataIndex: 'ProductGroupId',
      key: 'ProductGroupId',
      render: id => {
        return expenseConfig.ProductGroup[id] ? expenseConfig.ProductGroup[id] : (id.length < 10 ? id : id.slice(0,7) + '...');
      }
    }, {
      title: '发生时间',
      dataIndex: 'Monthly',
      key: 'Monthly',
      sorter: (a, b, Orders) => {
        let order = Orders === 'ascend' ? 'Monthly/ASC' : 'Monthly/DESC';
        getData(order);
      }
    }, {
      title: '账单类型',
      dataIndex: 'BillType',
      key: 'BillType',
      render: ConfigMapValue.BillType,
    }, {
      title: '账单金额',
      dataIndex: 'BillAmount',
      key: 'BillAmount',
      render: stdMoney,
      sorter: (a, b, Orders) => {
        let order = Orders === 'ascend' ? 'BillAmount/ASC' : 'BillAmount/DESC';
        getData(order);
      }
    }, {
      title: '应付金额',
      dataIndex: 'ShouldPayAmount',
      key: 'ShouldPayAmount',
      render: stdMoney,
      sorter: (a, b, Orders) => {
        let order = Orders === 'ascend' ? 'ShouldPayAmount/ASC' : 'ShouldPayAmount/DESC';
        getData(order);
      }
    }, {
      title: '操作',
      key: 'access',
      render(_, rowData) {
        return (<a onClick={() => { callback({
          name: rowData.Identity,
          payStatus: 0,
          payType: 'post',
          time: rowData.Monthly,
          productId: rowData.ProductGroupId
        }); }}>详情</a>);
      }
    }
  ];
};
export const OrderSummaryColumns = function(callback){
  return [
    {
      title: '用户名',
      dataIndex: 'Identity',
      key: 'Identity'
    },
    {
      title: '产品名称',
      dataIndex: 'ProductGroupId',
      key: 'ProductGroupId',
      render: id => {
        return expenseConfig.ProductGroup[id] ? expenseConfig.ProductGroup[id] : (id.length < 10 ? id : id.slice(0,7) + '...');
      }
    }, {
      title: '发生时间',
      dataIndex: 'Monthly',
      key: 'Monthly',
    }, {
      title: '订单类型',
      dataIndex: 'IsTest',
      key: 'IsTest',
      render: ConfigMapValue.IsTest,
    }, {
      title: '订单金额',
      dataIndex: 'OrderAmount',
      key: 'OrderAmount',
      render: stdMoney
    }, {
      title: '应付金额',
      dataIndex: 'PayAmount',
      key: 'PayAmount',
      render: stdMoney
    }, {
      title: '操作',
      key: 'access',
      render(_, rowData) {
        return (<a onClick={() => { callback({
          payType: 'pre',
          time: rowData.Monthly,
          productId: rowData.ProductGroupId
        }); }}>详情</a>);
      }
    }
  ]; };
export const BillColumns = function(getData, service, hashStr) {
  return [
    {
      title: '用户名',
      dataIndex: 'Identity',
      key: 'Identity',
    },
    {
      title: '账单号',
      dataIndex: 'Id',
      key: 'Id',
      render: hideId,
    }, {
      title: '发生时间',
      dataIndex: 'BeginTime',
      key: 'BeginTime',
      render: stdTimeRangeDaily,
      sorter: (a, b, Orders) => {
        let order = Orders === 'ascend' ? 'BeginTime/ASC' : 'BeginTime/DESC';
        getData(order);
      },
      width: 230
    }, {
      title: '产品名称',
      dataIndex: 'ProductGroupId',
      key: 'ProductGroupId',
      render: id => {
        return expenseConfig.ProductGroup[id] ? expenseConfig.ProductGroup[id] : (id.length < 10 ? id : id.slice(0,7) + '...');
      },
    }, {
      title: '账单类型',
      dataIndex: 'BillType',
      key: 'BillType',
      render: ConfigMapValue.BillType,
    }, {
      title: '账单金额',
      dataIndex: 'BillAmount',
      key: 'BillAmount',
      render: stdMoney,
      sorter: async (a, b, Orders) => {
        let order = Orders === 'ascend' ? 'BillAmount/ASC' : 'BillAmount/DESC';
        getData(order);
      },
    }, {
      title: '应付金额',
      dataIndex: 'ShouldPayAmount',
      key: 'ShouldPayAmount',
      render: stdMoney,
      sorter: async (a, b, Orders) => {
        let order = Orders === 'ascend' ? 'ShouldPayAmount/ASC' : 'ShouldPayAmount/DESC';
        getData(order);
      },
    }, {
      title: '支付状态',
      dataIndex: 'Status',
      key: 'Status',
      render: ConfigMapValue.OrderStatus,
    }, {
      title: '操作',
      dataIndex: 'Id',
      key: 'access',
      render(Id,record) {
        let hash = '';
        if (record.Customer) {
          hash = '&_customer=' + record.Customer;
        }
        if (record.ServiceTree) {
          hash = hash + '&_servicetree=' + record.ServiceTree;
        }
        // if (service) {
        //   hash = hash + '&_service=' + service;
        // }
        return (<Link to={`/app/billing/bill/all/${Id}/${hashStr + hash}`}>详情</Link>);
      }
      // render(Id,record) {
      //   return (<Link to={`/app/billing/bill/${record.Service}/${Id}/`}>详情</Link>);
      // },
    }
  ]; };
export const OverviewBillColumns = [
  {
    title: '产品名称',
    dataIndex: 'Service',
    key: 'Service',
    render: stdServiceName
  }, {
    title: '发生时间',
    dataIndex: 'BeginTime',
    key: 'BeginTime',
    render: stdTimeMonth
  }, {
    title: '账单金额',
    dataIndex: 'BillAmount',
    key: 'BillAmount',
    render: stdMoney,
  }, {
    title: '应付金额',
    dataIndex: 'ShouldPayAmount',
    key: 'ShouldPayAmount',
    render: stdMoney
  }
];
export const OrderColumns = [
  {
    title: '订单号',
    dataIndex: 'Id',
    key: 'Id',
    render: hideId,
  }, {
    title: '产品名称',
    dataIndex: 'Service',
    key: 'Service',
    render: stdServiceName
  }, {
    title: '订单类型',
    dataIndex: 'OrderType',
    key: 'OrderType',
    render: ConfigMapValue.OrderType
  }, {
    title: '下单时间',
    dataIndex: 'CreateTime',
    key: 'CreateTime',
    render: stdTime,
  }, {
    title: '开通时间',
    dataIndex: 'BeginTime',
    key: 'BeginTime',
    render: stdTime,
  }, {
    title: '应付金额',
    dataIndex: 'OrderAmount',
    key: 'OrderAmount',
    render: stdMoney
  }, {
    title: '支付状态',
    dataIndex: 'Status',
    key: 'Status',
    render: ConfigMapValue.OrderStatus
  }, {
    title: '操作',
    dataIndex: 'Id',
    key: 'access',
    render(Id) {
      return (<Link to={`/expense/order/${Id}/`}>详情</Link>);
    }
  }
];
export const RunningOrderColumns = [
  {
    title: '用户名',
    dataIndex: 'Identity',
    key: 'Identity'
  }, {
    title: '消费时间',
    dataIndex: 'PayTime',
    key: 'PayTime',
    render: stdTime,
  }, {
    title: '产品名称',
    dataIndex: 'Service',
    key: 'Service',
    render: stdServiceName
  }, {
    title: '订单类型',
    dataIndex: 'OrderType',
    key: 'OrderType',
    render: ConfigMapValue.OrderType
  }, {
    title: '订单号',
    dataIndex: 'Id',
    key: 'Id',
    render: hideId,
  }, {
    title: '应付金额',
    dataIndex: 'OrderAmount',
    key: 'OrderAmount',
    render: stdMoney
  }, {
    title: '支付状态',
    dataIndex: 'Status',
    key: 'Status',
    render: ConfigMapValue.OrderStatus
  }, {
    title: '操作',
    dataIndex: 'Id',
    key: 'access',
    render(Id) {
      return (<Link to={`/expense/order/${Id}/`}>详情</Link>);
    }
  }
];