import React, { Component } from 'react';
import { Button, Select, Table, Divider, Modal, message } from 'antd';
import { colFormat } from '@util/index';
import Apis from '../../../util/request';
import TableControlButton from '@component/TableControlButton';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import UserGroupModal from './userGroupModal';
import moment from 'moment';
import Drawer from './drawer';
import Link from '@component/Link';

// const Search = Input.Search;
const Option = Select.Option;
const confirm = Modal.confirm;

@connect(state => {
  return {
    user: state.User.Info,
  };
})
@withRouter
class UserGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      AppId: '',
      apps: [],
      drawerVisible: false,
    };
  }

  componentDidMount = async () => {
    const apps = (await Apis.ListApp({
      Limit: 999,
      Email: this.props.user.email,
    })).List;
    this.setState({
      apps
    }, () => {
      const AppId = window.location.hash.split('=')[1];
      if (AppId) {
        this.getData({ AppId });
      } else if (apps && apps.length > 0) {
        this.getData({ AppId: apps[0].Id });
      } else {
        this.search([]);
      }
    });
  }

  getData = async params => {
    const AppId = params && params.AppId || this.state.AppId;
    params = {
      AppId: this.state.AppId,
      Limit: 999,
      Email: this.props.user.email,
      AppName: this.getAppName({ AppId, apps: this.state.apps }),
      ...params
    };
    const data = await Apis.ListAppGroupAndCount(params);
    this.setState({
      AppId,
      data,
    });
    this.search(data.List);
  }

  search = (data, search) => {
    let list = [];
    search = search ? search : this.state.search;
    if (search) {
      data.forEach(ele => {
        if (ele.Resource.indexOf(search) > -1 || ele.Name.indexOf(search) > -1) {
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

  deleteResource = async GroupId => {
    await Apis.DeleteAppGroup({
      AppName: this.getAppName(),
      Email: this.props.user.email,
      GroupId
    });
    message.success('删除成功');
    this.getData();
  }

  columns = [
    colFormat('用户组名', 'Name'),
    colFormat('成员个数', 'count'),
    colFormat('创建时间', 'CreateTime', time => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')),
    colFormat('操作', 'chosen', (_, rowData) => {
      return (
        <span>
          <Link key='auth' to={`./${rowData.AppId}/${rowData.Id}/`}>授权</Link>
          <Divider type="vertical" />
          <TableControlButton
            data={rowData}
            key="manage"
            onClick={() => {
              this.setState({
                drawerVisible: !this.state.drawerVisible,
                drawerAppId: rowData.AppId,
                drawerGroupId: rowData.Id
              });
            }}
          >
              成员管理
          </TableControlButton>
          <Divider type="vertical" />
          <TableControlButton
            data={rowData}
            key="update"
            onClick={() => {
              this.setState({
                status: 'update',
                visible: !this.state.visible,
                initialValue: rowData,
              });
            }}
          >
              编辑
          </TableControlButton>
          <Divider type="vertical" />
          <TableControlButton
            data={rowData}
            key="delete"
            onClick={() => {
              let self = this;
              confirm({
                title: '您确定要删除该资源吗?',
                content: '删除后已经关联的授权将自动失效',
                onOk() {
                  self.deleteResource(rowData.Id);
                }
              });
            }}
          >
              删除
          </TableControlButton>
        </span>
      ); })]
  getAppName= (data = this.state) => {
    const {
      apps = [],
      AppId,
    } = data;
    let AppName = '';
    apps.some(app => {
      if (+app.Id === +AppId) {
        AppName = app.Name;
      }
    });
    return AppName;
  }
  render() {
    return (
      <div>
          应用名称：
        <Select
          showSearch
          style={{ width: 200 }}
          value={this.state.AppId + ''}
          onChange={AppId => {
            this.getData({ AppId });
          }}
        >
          {this.state.apps.map(app =>
            <Option key={app.Id} value={app.Id + ''}>{app.Name}</Option>
          )}
        </Select>
          &nbsp;&nbsp;&nbsp;
        {!!this.state.AppId && <Button type="primary"
          onClick={() => {
            this.setState({
              status: 'add',
              visible: !this.state.visible
            });
          }}
        >
        添加用户组
        </Button>}
        {/* <Search
      style={{ float: 'right', width: '30%' }}
      placeholder="请输入用户组名称"
      enterButton="搜索"
      onChange={value => {
        this.search(this.state.data.List, value.target.value);
      }}
    /> */}
        <br /><br />
        <Table
          dataSource={this.state.list}
          columns={this.columns}
          rowKey="Id"
          pagination={false}
        />
        <UserGroupModal
          appId={this.state.AppId}
          appName={this.getAppName()}
          status={this.state.status}
          visible={this.state.visible}
          initialValue={this.state.initialValue}
          change={() => {
            this.getData();
          }}
        />
        <Drawer
          visible={this.state.drawerVisible}
          appId={this.state.drawerAppId}
          appName={this.getAppName()}
          email={this.props.user.email}
          groupId={this.state.drawerGroupId}
        />
      </div>
    );
  }
}

export default UserGroup;