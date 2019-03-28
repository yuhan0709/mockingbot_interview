import React, { Component } from 'react';
import { message,Modal } from 'antd';
import ApiParamTable from './table';
import { withRouter } from 'react-router';
import Request from '../../../../util/request';
const { ListApiParam,
  CreateApiParam,
  UpdateApiParam,
  DeleteApiParam
} = Request;

@withRouter
class ApiParam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiParams: {}
    };
  }
  onPaginationChange = ()=>{
    console.log('change pagination');
  }

  async componentDidMount() {
    await this.checkPage();
  }

  checkPage = async() => {
    const ServiceId = this.props.match.params.ServiceId;
    const ApiId = this.props.match.params.ApiId;
    const apiParams = await ListApiParam({ BusinessID: ServiceId,ApiId });
    this.setState({
      apiParams
    });
  }

  add = async (data) => {
    try {
      const ServiceId = this.props.match.params.ServiceId;
      const ApiId = this.props.match.params.ApiId;
      await CreateApiParam({
        BusinessID: ServiceId,
        ApiId,
        ...data
      });
      message.success('新增API参数成功');
      await this.checkPage();
    } catch (e) {
      message.error('新增API参数失败');
    }
  }

  edit = async (data) => {
    try {
      const ServiceId = this.props.match.params.ServiceId;
      const ApiId = this.props.match.params.ApiId;
      await UpdateApiParam({
        BusinessID: ServiceId,
        ApiId,
        ...data
      });
      message.success('编辑API参数成功');
      await this.checkPage();
    } catch (e) {
      message.error('编辑API参数失败');
    }
  }

  delete = async (data) =>{
    Modal.confirm({
      title: '',
      content: `您确认要删除参数${data.Key}吗？`,
      iconType: 'info-circle',
      okType: 'danger',
      onOk: async () => {
        try {
          const ServiceId = this.props.match.params.ServiceId;
          await DeleteApiParam({
            BusinessID: ServiceId,
            ApiParamIds: data.ApiParamId + ''
          });
          message.success('删除API参数成功');
          await this.checkPage();
        } catch (e) {
          message.error('删除API参数失败');
        }
      }
    });
  }

  render() {
    return (
      <div>
        <ApiParamTable
          dataSource={this.state.apiParams}
          rowKey="ApiParamId"
          onPaginationChange={this.onPaginationChange}
          add={this.add}
          edit={this.edit}
          delete={this.delete}
        />
      </div>
    );
  }
}


export default ApiParam;