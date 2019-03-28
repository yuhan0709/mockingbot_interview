import React, { Component } from 'react';
import moment from 'moment';
import TableControlButton from '@component/TableControlButton';
import { withRouter } from 'react-router';
import { Button, Table, Divider, DatePicker, Input, message } from 'antd';
import Apis from '../../../../../util/request';
import Drawer from './drawer.js';
import Modal from '../product/modal.js';

const { RangePicker } = DatePicker;

@withRouter
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
      time: {},
      modalData: {
        ProductGroupId: '',
        AccountId: '',
      },
      ProductGroupMetadata: {},
      onLine: false,
    };
  }

  param = {
  };

  searchUser = (e) => {
    const value = e.target.value;
    this.param.AccountIds = value;
  }

  search = () => {
    this.getData(this.param);
  }

  columns = [
    colFormat('用户ID', 'AccountId'),
    colFormat('创建时间', 'CreateTime', time => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')),
    colFormat('是否过期', 'expiry', expiry => {
      return expiry ? '是' : '否';
    }),
    colFormat('操作', 'chosen', (_, rowData) => {
      return (
        <span>
          <TableControlButton
            data={rowData}
            key="read"
            onClick={(_, data) => {
              this.setState({
                drawerStatus: 'read',
                drawerVisible: true,
                drawerInitialValue: data
              });
            }}
          >
            查看
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
            disabled={rowData.Status == '0'}
            data={rowData}
            key="readProduct"
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
        </span>
      );
    }),
  ]

  componentDidMount = async () => {
    const ProductGroupId = this.props.match.params.ID;
    this.getData({
      ProductGroupId,
    });
    try {
      const res = await Apis.GetProductGroup({ ProductGroupId, AccountId: 0 }, true);
      const ProductGroupMetadata = res.ProductGroupMetadata;
      this.setState({
        ProductGroupMetadata,
        onLine: true
      });
    } catch (e) {
      this.setState({
        onLine: false,
      });
    }
  }

  getData = async (query) => {
    query = {
      ...this.state.query,
      ...query,
    };
    if (!query.AccountIds) {
      delete query.AccountIds;
    }
    const data = await Apis.ListSpecialProductGroups(query);
    this.setState({
      query,
      data
    });
  }

  timeChange = data => {
    this.param.BeginTime = '';
    this.param.EndTime = '';
    if (data.length === 2) {
      this.param = {
        ...this.param,
        BeginTime: data[0].toISOString(),
        EndTime: data[1].toISOString()
      };
    }
  }

  tableChange = (current, size) => {
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
      onChange: this.tableChange
    };
    return (
      <div>
        <Button type="primary"
          style={{ marginRight: '20px' }}
          onClick={() => {
            if (this.state.onLine) {
              this.setState({
                drawerStatus: 'create',
                drawerVisible: true
              });
            } else {
              message.warning('商品组已下线');
            }
          }}
        >
          添加特殊定价
        </Button>
        <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.timeChange}/>
        <span>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <span className="common-box">用户ID:</span>
          <Input
            className="common-box"
            placeholder="请输入用户ID进行搜索"
            onChange={this.searchUser}
            style={{ width: 200 }}
          />
        </span>
        <Button type="primary" className="common-box" onClick={this.search}>
          查询
        </Button>
        <br /><br />
        <Table
          rowKey="AccountId"
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
          ProductGroupMetadata={this.state.ProductGroupMetadata}
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