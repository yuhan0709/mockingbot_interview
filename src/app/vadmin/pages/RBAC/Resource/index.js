import React, { Component } from 'react';
import { Button, Input, Select, Table, Divider, Modal, message } from 'antd';
import { colFormat } from '@util/index';
import Apis from '../../../util/request';
import TableControlButton from '@component/TableControlButton';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import ResourceModal from './resourceModal';

const Search = Input.Search;
const Option = Select.Option;
const confirm = Modal.confirm;

@connect(state => {
  return {
    user: state.User.Info,
  };
})
@withRouter
class Resource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      AppId: '',
      apps: []
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
    const rparams = {
      ...params,
      Limit: 999,
      Email: this.props.user.email,
      AppName: this.getAppName({ AppId, apps: this.state.apps }),
    };
    const data = await Apis.ListResource(rparams);
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

  deleteResource = async ResourceId => {
    await Apis.DeleteResource({
      AppName: this.getAppName(),
      Email: this.props.user.email,
      ResourceId
    });
    message.success('删除成功');
    this.getData();
  }

  columns = [
    colFormat('Resource ID', 'Resource'),
    colFormat('资源名称', 'Name'),
    colFormat('操作', 'chosen', (_, rowData) => {
      return (
        <span>
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
                onOk() {
                  self.deleteResource(rowData.Id);
                }
              });
            }}
          >
                      删除
          </TableControlButton>
        </span>
      );
    })]
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
          value={this.state.AppId  + ''}
          onChange={AppId => {
            this.getData({ AppId });
          }}
        >
          {this.state.apps.map(app =>
            <Option key={app.Id} value={app.Id  + ''}>{app.Name}</Option>
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
                    添加资源
        </Button>}
        <Search
          style={{ float: 'right', width: '30%' }}
          placeholder="Resource/资源名称"
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
        <ResourceModal
          appId={this.state.AppId}
          appName={this.getAppName()}
          status={this.state.status}
          visible={this.state.visible}
          initialValue={this.state.initialValue}
          change={() => {
            this.getData();
          }}
        />
      </div>
    );
  }
}

export default Resource;