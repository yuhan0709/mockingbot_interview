import style from './index.less';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import BusinessActions from '../../redux/actions/Business';
import { bindActionCreators } from 'redux';
import BusinessTable from './table';
import CreateBusiness from './createBusiness';
import Apis from '../../util/request';
import { message } from 'antd';

const { ListGroups } = Apis;
@connect((state) => ({
  business: state.Business.List,
  pagination: {
    Limit: state.Business.Limit,
    Offset: state.Business.Offset,
    Total: state.Business.Total
  }
}), (dispatch) => ({
  actions: bindActionCreators(BusinessActions, dispatch),
}))
export default class DocCenter extends Component {
  state = {
    groups: []
  }
  async componentDidMount() {
    const { Groups } = await ListGroups({ Limit: 50 });
    this.setState({
      groups: Groups
    });
    this.props.actions.getBusinessList({ Type: 1, Limit: 50, Offset: 0 });
  }
  createBusiness = async (data) => {
    try {
      await Apis.CreateBusinessWithResource({ GroupId: 1,Type: 1, ...data });
      message.success('新建文档库成功');
      this.props.actions.getBusinessList({ Type: 1, Limit: 50, Offset: 0 });
    } catch (e) {
      // message.error('新建文档库失败');
    }
  }
  editBusiness = async (data) => {
    try {
      await Apis.UpdateBusiness({ ...data,GroupId: 1 });
      message.success('修改文档库成功');
      this.props.actions.getBusinessList({ Type: 1, Limit: 50, Offset: 0 });
    } catch (e) {
      // message.error('修改文档库失败');
    }
  }
  toggleStatus = async (data) => {
    try {
      await Apis.UpdateBusiness({ ...data,Status: data.Status === 'online' ? 'offline' : 'online' });
      message.success(`${data.Status === 'online' ? '下线' : '发布'}成功`);
      this.props.actions.getBusinessList({ Type: 1, Limit: 50, Offset: 0 });
    } catch (e) {
      console.error(e);
    }
  }
  onPaginationChange = async ({ Limit, Offset }) => {
    console.log('change pagination', Limit, Offset);
    await this.props.actions.getBusinessList({
      Limit,
      Offset
    });
  }
  render() {
    return <div className={style.home} >
      <CreateBusiness
        createBusiness={this.createBusiness}
        appendInfo={this.state.groups}
      />
      <BusinessTable
        editBusiness={this.editBusiness}
        business={this.props.business}
        pagination={this.props.pagination}
        onPaginationChange={this.onPaginationChange}
        appendInfo={this.state.groups}
        onToggleStatus={this.toggleStatus}
      />
    </div>;
  }
}