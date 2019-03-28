import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import TopActions from '../../../redux/actions/Top';
import { bindActionCreators } from 'redux';
import ApiTable from './table';
import { message } from 'antd';

@withRouter
@connect((state) => ({
  apis: state.Top.Apis
}), (dispatch) => ({
  actions: bindActionCreators(TopActions, dispatch),
}))
class Api extends Component {
  query = ''
  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: [],
      limit: 10,
      offset: 0,
    };
  }

  async componentDidMount() {
    await this.checkPage();
  }

  // 刷新页面
  async checkPage(params = {}) {
    const ServiceId = this.props.match.params.ServiceId;
    await this.props.actions.getApis({ ServiceId, BusinessID: ServiceId, ...params, Query: this.query });
  }

  select = (selectedKeys)=>{
    this.setState({ selectedKeys });
  }

  onPaginationChange = async ({ limit, offset }) => {
    this.setState({
      limit, offset
    });
    await this.checkPage({ Limit: limit, Offset: offset });
  }

  add = async (data) =>{
    try {
      const ServiceId = this.props.match.params.ServiceId;
      await this.props.actions.addApi({ ...data,ServiceId,BusinessID: ServiceId });
      message.success('新增API成功');
      await this.checkPage();
    } catch (e) {
      message.error('新增API失败');
    }
  }

  edit = async (data) =>{
    try {
      const ServiceId = this.props.match.params.ServiceId;
      await this.props.actions.editApi({ ...data,ServiceId,BusinessID: ServiceId });
      message.success('修改API成功');
      await this.checkPage({ Limit: this.state.limit,Offset: this.state.offset });
    } catch (e) {
      message.error('修改API失败');
    }
  }


  publish = async () =>{
    if (this.state.selectedKeys.length === 0){
      message.warn('请先选择API');
      return;
    }
    try {
      const ServiceId = this.props.match.params.ServiceId;
      await this.props.actions.publishApi({ ApiIds: this.state.selectedKeys.join(','),ServiceId,BusinessID: ServiceId });
      this.setState({
        selectedKeys: []
      });
      message.success('发布API成功');
      await this.checkPage({ Limit: this.state.limit,Offset: this.state.offset });
    } catch (e) {
      message.error('发布API失败');
    }
  }

  search = async (query) => {
    try {
      this.query = query;
      await this.checkPage();
    } catch (e) {
      message.error('查询API失败');
    }
  }

  render() {
    return (
      <div>
        <ApiTable
          selectedKeys={this.state.selectedKeys}
          onSelect={this.select}
          onPaginationChange={this.onPaginationChange}
          addApi={this.add}
          editApi={this.edit}
          publishApi={this.publish}
          searchApi={this.search}
          apis={this.props.apis}
        />
      </div>
    );
  }
}

export default Api;