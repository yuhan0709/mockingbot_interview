import React, { PureComponent } from 'react';
import { Table, Tag } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import Link from '@component/Link';
import TableControlButton from '@component/TableControlButton';
import style from './index.less';
import BusinessForm from './businessForm';

export default class BusinessTable extends PureComponent {
  static propTypes = {
    business: PropTypes.array,
    paganation: PropTypes.object,
    onPaginationChange: PropTypes.func,
    editBusiness: PropTypes.func,
    onToggleStatus: PropTypes.func
  }
  static defaultProps = {
    business: [],
    paganation: {},
    onPaginationChange: ()=>{},
    editBusiness: () => {},
    onToggleStatus: ()=>{}
  }
  state = {
    selectBusinessID: 0,
    bizForm: {},
  }
  clickEditBusiness = (_, data) => {
    this.setState({ bizForm: {
      key: +new Date(),
      visible: true,
      isEdit: true,
      business: data,
      disabledOnline: false,
      confirmLoading: false,
      initialValueMap: {
        BusinessName: data.Name,
        BusinessEnName: data.EnName,
        BusinessShortName: data.ShortName,
        Status: data.Status,
        BusinessDescription: data.Description || '',
        GroupId: data.GroupId,
        Scope: data.Scope,
        BusinessIcon: data.Icon
      }
    } });
  }
  toggleStatus = (_,data) =>{
    this.props.onToggleStatus(data);
  }
  columns = [{
    title: '文档库名称',
    dataIndex: 'Name',
    key: 'Name',
    render: (name, rowData)=>{
      return  <Link key='edit' className={style.control} to={`./${rowData.BusinessID}/`}>{name}</Link>;
    }
  }, {
    title: '英文简称',
    dataIndex: 'ShortName',
    key: 'ShortName'
  }, {
    title: '状态',
    dataIndex: 'Status',
    key: 'Status',
    render: (status) => <Tag color={status === 'online' ? 'green' : 'red'} >{status}</Tag>
  }, {
    title: '更新时间',
    dataIndex: 'UpdateTime',
    key: 'UpdateTime',
    render: (time) =>  moment.unix(time).format('YYYY-MM-DD HH:mm:ss')
  }, {
    title: '操作',
    key: 'Op',
    render: (_, rowData) => {
      const isOnline = rowData.Status === 'online';
      return [
        <TableControlButton className={style.control} onClick={this.clickEditBusiness} data={rowData} key="s">设置</TableControlButton>,
        <TableControlButton className={`${style.control} ${isOnline ? style.red : style.green}`} onClick={this.toggleStatus} data={rowData} key="t">{ isOnline ? '下线' : '发布'}</TableControlButton>,
      ];
    }
  }]
  editBusiness = async (data) => {
    this.setState({ bizForm: { ...this.state.bizForm, confirmLoading: true } });
    try {
      await this.props.editBusiness(data);
      this.setState({ bizForm: { ...this.state.bizForm, visible: false, confirmLoading: false } });
    } catch (e) {
      this.setState({ bizForm: { ...this.state.bizForm, confirmLoading: false } });
    }
  }
  hideBizForm = () => {
    this.setState({ bizForm: { ...this.state.bizForm, visible: false } });
  }
  onPaginationChange = async (pageNumber) => {
    const Limit = this.props.pagination.Limit;
    const Offset = (pageNumber - 1) * Limit;
    this.props.onPaginationChange({ Limit, Offset });
  }
  render() {
    const pagination = {
      showQuickJumper: true,
      current: Math.floor(this.props.pagination.Offset / this.props.pagination.Limit) + 1,
      pageSize: this.props.pagination.Limit,
      total: this.props.pagination.Total,
      onChange: this.onPaginationChange,
      showTotal: total => `总共 ${total} 条数据，每页显示 ${this.props.pagination.Limit} 条`
    };
    return (
      <div>
        <Table
          dataSource={this.props.business}
          columns={this.columns}
          rowKey="BusinessID"
          pagination={pagination}
        />
        <BusinessForm
          onOk={this.editBusiness}
          onCancel={this.hideBizForm}
          appendInfo={this.props.appendInfo}
          {...this.state.bizForm}
        />
      </div>
    );
  }
}