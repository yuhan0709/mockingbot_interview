import React, { Component } from 'react';
import moment from 'moment';
import TableControlButton from '@component/TableControlButton';
import { withRouter } from 'react-router';
import { Button, Table, Divider, Input, Select } from 'antd';
import Apis from '../../../../util/request';
import Modal from './modal';
const Search = Input.Search;
const Option = Select.Option;

const statusMap = {
  active: '上线',
  inactive: '下线'
};
@withRouter
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      modalVisible: false,
      modalStatus: 'create',
      modalInitialValue: {},
      query: {},
      listServices: [],
      listServicesAll: []
    };
  }

    search = Query => {
      const query = {
        Query,
        Offset: 0,
      };
      this.getData(query);
    }

    select = Category => {
      const query = {
        Category,
        Offset: 0,
      };
      this.getData(query);
    }

    columns = [
      colFormat('策略名', 'PolicyName'),
      colFormat('备注', 'Description'),
      colFormat('状态', 'Status', status => {
        return statusMap[status];
      }),
      colFormat('所属服务', 'Category', category => {
        return this.serviceMap[category] ? this.serviceMap[category] : category;
      }),
      colFormat('创建时间', 'CreateDate', time => moment(time).format('YYYY-MM-DD HH:mm:ss')),
      colFormat('操作', 'chosen', (_, rowData) => {
        return (
          <span>
            <TableControlButton
              data={rowData}
              key="read"
              onClick={(_, data) => {
                this.setState({
                  modalStatus: 'read',
                  modalVisible: !this.state.modalVisible,
                  modalInitialValue: data
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
                  modalStatus: 'update',
                  modalVisible: !this.state.modalVisible,
                  modalInitialValue: data
                });
              }}
            >
                        编辑
            </TableControlButton>
          </span>
        );
      }),
    ]

    componentDidMount = async () => {
      this.getData();
      await this.getAllServices();
      const lsp = (await Apis.ListSystemPolicies({ Limit: 9999 })).PolicyMetadata;
      const listServices = {};
      lsp.map(ele => {
        listServices[ele.Category] = this.serviceMap[ele.Category];
      });
      this.setState({
        listServices
      });
    }

    serviceMap = {}

    getAllServices = async () => {
      let listServicesAll = (await Apis.IamListServices({ Limit: 9999 })).List;
      listServicesAll =  [{
        ServiceShortName: 'platform',
        ServiceName: '平台服务'
      }, ...listServicesAll];
      listServicesAll.map(service => {
        this.serviceMap[service.ServiceShortName] = service.ServiceName;
      });
      this.setState({
        listServicesAll
      });
    }

    getData = async (query) => {
      query = {
        ...this.state.query,
        ...query,
      };
      const data = await Apis.ListSystemPolicies(query);
      this.setState({
        query,
        data
      });
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
        onChange: this.tableChange,
        showTotal: () => `共有 ${this.state.data.Total} 条数据，每页显示 ${this.state.data.Limit} 条`
      };
      return (
        <div>
          <Button type="primary"
            style={{ marginRight: '20px' }}
            onClick={() => {
              this.setState({
                modalStatus: 'create',
                modalVisible: !this.state.modalVisible,
                modalInitialValue: {}
              });
            }}
          >
                    添加策略
          </Button>
          <div style={{ width: 400, float: 'right' }}>
            <Search
              placeholder="请输入策略名或备注"
              enterButton
              onChange={ele => {
                this.search(ele.target.value);
              }}
              onSearch={this.search}
            />
          </div>
          <div style={{ width: 250, float: 'right' }}>
            <Select
              allowClear
              showSearch
              style={{ width: 200 }}
              placeholder="全部服务"
              optionFilterProp="children"
              onChange={this.select}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {Object.keys(this.state.listServices).map(key => {
                return  <Option key={key} value={key}>{this.state.listServices[key]}</Option>;
              })}
            </Select>
          </div>
          <br /><br />
          <Table
            rowKey="PolicyTrn"
            dataSource={this.state.data.PolicyMetadata}
            columns={this.columns}
            pagination={pagination}
          />
          <Modal
            visible={this.state.modalVisible}
            status={this.state.modalStatus}
            initialValue={this.state.modalInitialValue}
            listServices={this.state.listServicesAll}
            search={this.search}
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