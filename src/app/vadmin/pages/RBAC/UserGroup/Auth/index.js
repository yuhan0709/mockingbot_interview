import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { Icon, Input, Table, Switch, Button, message, Modal } from 'antd';
import style from './index.less';
import Apis from '../../../../util/request';
import { colFormat } from '@util/index';

@withRouter
@connect(state => {
  return {
    user: state.User.Info,
  };
})
class Auth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      input: {},
      button: {},
      _switch: {},
      ids: {}
    };
  }

  AppId = ''

  GroupId = ''

  componentDidMount() {
    this.AppId = this.props.match.params.appId;
    this.GroupId = this.props.match.params.groupId;
    this.getApps();
  }

  getApps = async() => {
    const apps = (await Apis.ListApp({
      Limit: 999,
    })).List;
    let AppName = '';
    apps.some(app => {
      if (+app.Id === +this.AppId) {
        AppName = app.Name;
      }
    });
    this.setState({
      AppName
    }, this.getResourceList);
  }

  historyBack = () => {
    history.back();
  }

  getResourceList = async () => {

    const list = (await Apis.ListResource({
      AppName: this.state.AppName,
      Email: this.props.user.email,
      Limit: 999,
    })).List;
    this.getPermission(list);
  }

  getPermission = async list => {
    if (!list) {
      list = [...this.state.list];
    }
    const permissionList = (await Apis.ListGroupPermission({
      AppName: this.state.AppName,
      Email: this.props.user.email,
      GroupId: this.GroupId,
      Limit: 999,
    })).List;
    const input = {};
    const button = {};
    const _switch = {};
    const ids = {};
    list.forEach(ele => {
      permissionList.forEach(permission => {
        if (permission.ResourceId === ele.Id) {
          //ele.action = permission.Actions;
          //ele.RelationGroupPermissionId = permission.Id;
          ids[ele.Id] = permission.Id;
          input[ele.Id] = permission.Actions.toString();
          _switch[ele.Id] = true;
        }
      });
    });
    this.setState({
      list,
      input,
      button,
      _switch,
      ids
    });
  }

  setPermission = async (ResourceId, Actions) => {
    const input = {
      ...this.state.input
    };
    const ids = {
      ...this.state.ids
    };
    const button = {
      ...this.state.button
    };
    const _switch = {
      ...this.state._switch
    };
    const RelationGroupPermissionId = ids[ResourceId];
    if (RelationGroupPermissionId) {
      if (!Actions) {
        Modal.confirm({
          title: '确认要删除吗？',
          content: '删除后可能会导致此项不可用',
          onOk: async () => {
            await Apis.RemoveGroupPermission({
              AppName: this.state.AppName,
              RelationGroupPermissionId,
              Email: this.props.user.email,
            });
            _switch[ResourceId] = false;
            ids[ResourceId] = null;
            message.success('删除成功');
            button[ResourceId] = false;
            this.setState({
              ids,
              button,
              _switch
            });
          }
        });
      } else {
        await Apis.UpdateGroupPermission({
          AppName: this.state.AppName,
          Email: this.props.user.email,
          RelationGroupPermissionId,
          Actions,
        });
        message.success('保存成功');
        button[ResourceId] = false;
      }
    } else {
      const res = await Apis.AddGroupPermission({
        AppName: this.state.AppName,
        Email: this.props.user.email,
        GroupId: this.GroupId,
        ResourceId,
        Actions,
      });
      _switch[ResourceId] = true;
      message.success('添加成功');
      ids[ResourceId] = res.RelationGroupPermission.Id;
      input[ResourceId] = res.RelationGroupPermission.Actions.toString();
      button[ResourceId] = false;
    }
    this.setState({
      input,
      ids,
      button,
      _switch
    });
  }

  columns = [
    colFormat('资源名称', 'Name', '' ,{ width: 300 }),
    colFormat('Resource ID', 'Resource', '' ,{ width: 200 }),
    colFormat('Action', 'action', (_, rowData) => {
      const action = this.state._switch[rowData.Id];
      return (
        <div className={style.action}>
          <Switch checked={action} onChange={async () => {
            if (action) {
              await this.setPermission(rowData.Id, false);
            } else {
              await this.setPermission(rowData.Id, 'r,w');
            }
          }} />
          {
            action &&
            <Input style={{ width: 250 }} value={this.state.input[rowData.Id]} onChange={e => {
              const value = e.target.value;
              const input = {
                ...this.state.input
              };
              const button = {
                ...this.state.button
              };
              input[rowData.Id] = value;
              button[rowData.Id] = true;
              this.setState({
                input,
                button
              });
            }}/>
          }
          {
            this.state.button[rowData.Id] &&
            <Button type="primary" size={'small'} onClick={async () => {
              await this.setPermission(rowData.Id, this.state.input[rowData.Id]);
            }}>保存</Button>
          }
        </div>
      );
    })
  ]

  render() {
    return (
      <div>
        <div className={style.top_op}>
          <span className={style.back}  onClick={this.historyBack}>
            <Icon type="left" theme="outlined" /> 返回
          </span>
          {/* <Button type="primary" className={style.ml}>保存更改</Button> */}
        </div>
        <Table
          dataSource={this.state.list}
          columns={this.columns}
          pagination={false}
          rowKey='Id'
        />
      </div>
    );
  }
}

export default Auth;