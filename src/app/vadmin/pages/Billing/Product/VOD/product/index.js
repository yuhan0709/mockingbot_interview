import React, { Component } from 'react';
import { Button, Table, Divider } from 'antd';
import Drawer from './drawer.js';
import Modal from './modal.js';
import Apis from '../../../../../util/request';
import moment from 'moment';
import TableControlButton from '@component/TableControlButton';
import Navigate from '../../../../../../../public/util/navigate';

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      drawerVisible: false,
      modalVisible: false,
      drawerStatus: 'create',
      drawerInitialValue: {},
      query: {},
      modalData: {
        ProductGroupId: '',
        AccountId: '',
      },
      ListBusiness: [],
    };
  }

  componentDidMount = async () => {
    this.getData();
    const ListBusiness = (await Apis.ListBusiness({ Type: 1, Limit: 999, Offset: 0 })).List;
    this.setState({
      ListBusiness
    });
  }

  getData = async (query) => {
    const data = await Apis.ListProductGroupsByAccount(query);
    this.setState({
      query,
      data
    });
  }

  columns = [
    colFormat('产品名称', 'Service', service => {
      let res = window.INIT_CONFIG.expenseConfig.Service[service];
      res = res ? res : service;
      return res;
    }),
    colFormat('商品组ID', 'Id'),
    colFormat('商品组名称', 'ProductName'),
    colFormat('商品类型', 'PayType', pt => window.INIT_CONFIG.expenseConfig.PayType[pt]),
    colFormat('计费项组合', 'BillingMethodSets', bms => {
      return bms ? bms.map(obj => {
        return <p key={obj.Category}>{window.INIT_CONFIG.expenseConfig.BillingMethodCategory[obj.Category]}</p>;
      }) : '';
    }),
    colFormat('地区', 'Region', region => window.INIT_CONFIG.expenseConfig.Region[region]),
    colFormat('上线状态', 'Status', status => status == '1' ? '上线' : '下线'),
    colFormat('更新时间', 'UpdateTime', time => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')),
    colFormat('操作', 'chosen', (_, rowData) => {
      return (
        <span>
          <TableControlButton
            disabled={rowData.Status != '1'}
            data={rowData}
            key="read"
            onClick={() => {
              this.setState({
                modalData: {
                  ProductGroupId: rowData.Id,
                  AccountId: rowData.AccountId,
                },
                modalVisible: !this.state.modalVisible
              });
            }}
          >
            查看商品
          </TableControlButton>
          <Divider type="vertical" />
          <TableControlButton
            data={rowData}
            key="update"
            onClick={(_, data) => {
              this.setState({
                drawerStatus: 'update',
                drawerVisible: true,
                drawerInitialValue: data
              });
            }}
          >
            编辑
          </TableControlButton>
          <Divider type="vertical" />
          <TableControlButton
            data={rowData}
            key="special"
            onClick={() => {
              Navigate.go(`./${rowData.Id}/`);
            }}
          >
            特殊定价
          </TableControlButton>
        </span>
      );
    }),
  ]

  onChange = (current, size) => {
    const Limit = size;
    const Offset = (current - 1) * size;
    this.getData({ Limit,Offset });
  }

  render() {
    const pagination = {
      showQuickJumper: true,
      current: Math.floor(this.state.data.Offset / this.state.data.Limit) + 1,
      pageSize: this.state.data.Limit,
      total: this.state.data.Total,
      onChange: this.onChange
    };
    return (
      <div>
        <Button type="primary"
          onClick={() => {
            this.setState({
              drawerStatus: 'create',
              drawerVisible: true
            });
          }}
        >
          添加商品组
        </Button><br /><br />
        <Table
          rowKey="Id"
          dataSource={this.state.data.ProductGroupMetadatas}
          columns={this.columns}
          pagination={pagination}
        />
        <Drawer
          onClose={() => {
            this.setState({
              drawerVisible: false
            });
          }}
          confirm={() => {
            this.getData();
          }}
          status={this.state.drawerStatus}
          visible={this.state.drawerVisible}
          initialValue={this.state.drawerInitialValue}
        />
        <Modal
          data={this.state.modalData}
          visible={this.state.modalVisible}
        />
      </div>
    );
  }
}

function colFormat(title, key, render) {
  const res = {
    title: title,
    dataIndex: key,
    key: key,
  };
  if (render) {
    res['render'] = render;
  }
  return res;
}
export default Product;