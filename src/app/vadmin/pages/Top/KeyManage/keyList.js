import React, { Component } from 'react';
import { Table, Tag } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import TableControlButton from '@component/TableControlButton';
import style from './index.less';

const statusMap = {
  Active: { value: 'active', label: '已启用' },
  Inactive: { value: 'inactive', label: '已禁用' },
};
const NOOP = () => {};
const timeformat = 'YYYY-MM-DD HH:mm:ss';
export default class KeyList extends Component {
  static propTypes = {
    data: PropTypes.array,
    updateKey: PropTypes.func,
    deleteKey: PropTypes.func,
  }
  static defaultProps = {
    data: [],
    updateKey: NOOP,
    deleteKey: NOOP,
  }
  columns = [
    {
      key: 'AccessKeyId',
      width: 300,
      dataIndex: 'AccessKeyId',
      title: 'AccessKey ID'
    },
    {
      key: 'secret',
      title: 'Access Key Secret',
      render: () => (<span>暂不可见</span>)
    },
    {
      key: 'Status',
      dataIndex: 'Status',
      title: '状态',
      render: (status) => status === statusMap.Active.value ?
        <Tag color="green">{statusMap.Active.label}</Tag>
        : <Tag color="red">{statusMap.Inactive.label}</Tag>
    },
    {
      key: 'UserName',
      dataIndex: 'UserName',
      title: '用户名',
      render: (value) => <span>{value || '主账号'}</span>
    },
    {
      key: 'CreateDate',
      dataIndex: 'CreateDate',
      title: '创建时间',
      render: (timestring) => moment(timestring).format(timeformat)
    },
    {
      key: 'operator',
      title: '操作',
      render: (_, rowData) => {
        if (rowData.Status === statusMap.Active.value) {
          return [
            (<TableControlButton popProps={{ placement: 'topRight' }} needConfirm confirmText="确定要禁用该AccessKey吗？" buttonType="danger" data={rowData} onClick={this.inactiveKey} key="inactive">禁用</TableControlButton>),
            (<span className={style.gap} key="gap" />),
            (<TableControlButton popProps={{ placement: 'topRight' }} needConfirm confirmText="确定要删除该AccessKey吗？" data={rowData} onClick={this.deleteKey} key="delete" disabled>删除</TableControlButton>),
          ];
        }
        return [
          (<TableControlButton buttonType="success" data={rowData} onClick={this.activeKey} key="active">启用</TableControlButton>),
          (<span className={style.gap} key="gap" />),
          (<TableControlButton popProps={{ placement: 'topRight' }} needConfirm confirmText="确定要删除该AccessKey吗？" buttonType="danger" data={rowData} onClick={this.deleteKey} key="delete">删除</TableControlButton>),
        ];
      }
    }
  ]
  inactiveKey = (_, data) => {
    this.props.updateKey(data.AccessKeyId, statusMap.Inactive);
  }
  activeKey = (_, data) => {
    this.props.updateKey(data.AccessKeyId, statusMap.Active);
  }
  deleteKey = (_, data) => {
    this.props.deleteKey(data.AccessKeyId);
  }
  render() {
    return <div>
      <Table
        columns={this.columns}
        dataSource={this.props.data}
        rowKey="AccessKeyId"
        pagination={false}
      />
    </div>;
  }
}
