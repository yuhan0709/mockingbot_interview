import React, { Component } from 'react';
import { Button, Input, Table, Divider, Modal, message } from 'antd';
import { colFormat } from '@util/index';
import TableControlButton from '@component/TableControlButton';
import Apis from '../../../util/request';
import AppModal from './appModal';
import { connect } from 'react-redux';
import Link from '@component/Link';
import Drawer from './drawer';

const Search = Input.Search;
const confirm = Modal.confirm;

@connect(state => {
  return {
    user: state.User.Info,
  };
})
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        Limit: 0,
        List: [],
        Offset: 0,
        Total: 0,
        drawerVisible: false,
        appVisible: false,
        appStatus: '',
        appInitValue: {},
      },
    };
  }

  async componentDidMount() {
    this.getData();
  }

  getData = async () => {
    // console.log(await Apis.GetEmployeePermission2())
    const data = await Apis.ListApp({ Limit: 999, Email: this.props.user.email });
    this.setState({
      data
    });
    this.search(data.List);
  }

  search = (data, search) => {
    let list = [];
    search = search ? search : this.state.search;
    if (search) {
      data.forEach(ele => {
        if ((ele.Id + '').indexOf(search) > -1 || ele.Name.indexOf(search) > -1) {
          list.push(ele);
        }
      });
    } else {
      list = [...data];
    }
    this.setState({
      search,
      list
    });
  }

  deleteApp = async AppId => {
    await Apis.DeleteApp({
      AppId,
      Email: this.props.user.email
    });
    message.success('删除成功');
    this.getData();
  }

  columns = [
    colFormat('App ID', 'Id'),
    colFormat('应用名称', 'Name'),
    colFormat('操作', 'chosen', (_, rowData) => {
      return (
        <span>
          <TableControlButton
            data={rowData}
            key="read"
            onClick={() => {
              this.setState({
                appInitValue: rowData,
                appStatus: 'read',
                appVisible: !this.state.appVisible
              });
            }}
          >
            查看
          </TableControlButton>
          <Divider type="vertical" />
          <TableControlButton
            data={rowData}
            key="update"
            onClick={() => {
              this.setState({
                appInitValue: rowData,
                appStatus: 'update',
                appVisible: !this.state.appVisible
              });
            }}
          >
            编辑
          </TableControlButton>
          <Divider type="vertical" />
          <Link key='resource' to={'./resource/#id=' + rowData.Id}>资源管理</Link>
          <Divider type="vertical" />
          <TableControlButton
            data={rowData}
            key="manager"
            onClick={() => {
              this.setState({
                drawerVisible: !this.state.drawerVisible,
                drawerAppId: rowData.Id,
              });
            }}
          >
            管理员
          </TableControlButton>
          <Divider type="vertical" />
          <Link key='usergroup' to={'./usergroup/#id=' + rowData.Id}>用户组</Link>
          <Divider type="vertical" />
          <TableControlButton
            data={rowData}
            key="delete"
            onClick={() => {
              let self = this;
              confirm({
                title: '您确定要删除该应用吗?',
                onOk() {
                  self.deleteApp(rowData.Id);
                }
              });
            }}
          >
            删除
          </TableControlButton>
        </span>
      );
    }),
  ]

  onChange = (current, size) => {
    const Limit = size;
    const Offset = (current - 1) * size;
    this.getData({ Limit, Offset });
  }

  render() {
    return (
      <div>
        <Button type="primary"
          onClick={() => {
            this.setState({
              appStatus: 'add',
              appVisible: !this.state.appVisible
            });
          }}
        >
          添加应用
        </Button>
        <a style={{ marginLeft: '10px' }} href="https://bytedance.feishu.cn/space/doc/doccn2jKqhh0zloMLlYu9t" target="_blank" rel="noopener noreferrer">权限说明</a>
        <Search
          style={{ float: 'right', width: '30%' }}
          placeholder="输入App ID/应用名称"
          enterButton="搜索"
          onChange={value => {
            this.search(this.state.data.List, value.target.value);
          }}
        />
        <br /><br />
        <Table
          dataSource={this.state.list}
          columns={this.columns}
          rowKey="Id"
          pagination={false}
        />
        <AppModal
          status={this.state.appStatus}
          visible={this.state.appVisible}
          initialValue={this.state.appInitValue}
          change={() => {
            this.getData();
          }}
        />
        <Drawer
          visible={this.state.drawerVisible}
          appId={this.state.drawerAppId}
          email={this.props.user.email}
        />
      </div>
    );
  }
}

export default App;