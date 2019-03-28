import React, { Component } from 'react';
import { Input, Button, message } from 'antd';
import Table from './table';
import Apis from '../../../util/request';
import { withRouter } from 'react-router';
import ResourceModal from './resourceModal.js';


const Search = Input.Search;
@withRouter
class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: {},
      refresh: {},
      data: {},
      queryValue: '',
      selectedRowKeys: [],
      visible: false,
      publishLoading: false
    };
  }

  componentDidMount() {
    this.getData({
      ServiceId: this.props.match.params.ServiceId
    });

  }

  getData = async (query = {}) => {
    query = {
      ...this.state.query,
      ...query,
    };
    const data = await Apis.ListResourceType({ BusinessID: this.props.match.params.ServiceId,...query },);
    data.List.forEach(ele => {
      ele.key = ele.ResourceTypeId;
    });
    this.setState({
      data,
      query: {
        Query: query.Query,
        ServiceId: query.ServiceId,
      },
      refresh: query,
      selectedRowKeys: [],
    });
  }

  refresh = () => {
    this.getData(this.state.refresh);
  }

  change = event => {
    let val = event.target.value.trim();
    this.setState({
      queryValue: val
    });
    this.getData({ Query: val });
  }

  addResource = () => {
    this.setState({
      visible: true
    });
  }

  publish = async () => {
    const ResourceTypeIds = this.state.selectedRowKeys.join();
    if (ResourceTypeIds) {
      this.setState({ publishLoading: true });
      await Apis.PublishResourceType({
        BusinessID: this.props.match.params.ServiceId,
        ResourceTypeIds
      }).finally(()=>{
        this.setState({ publishLoading: false });
      });
      message.success('发布成功');
      this.refresh();
    }
  }

  select = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  }

  render() {
    return (
      <div>
        <Button type="primary" style={{ margin: 'auto 20px 20px auto' }} onClick={this.addResource}>+ 新增资源</Button>
        <Button type="primary" onClick={this.publish} loading={this.state.publishLoading}> 发&nbsp;&nbsp;布 </Button>
        <Search
          placeholder="输入资源中文/英文名称"
          onChange={this.change}
          value = {this.state.queryValue}
          style={{ display: 'block',width: 400,float: 'right' }}
        />
        <Table
          ServiceId={this.props.match.params.ServiceId}
          data={this.state.data}
          getData={this.getData}
          onChange={this.select}
          selectedRowKeys={this.state.selectedRowKeys}
          refresh={this.refresh}
        />
        <ResourceModal
          ServiceId={this.props.match.params.ServiceId}
          title="新增资源"
          visible={this.state.visible}
          hideModal={() => { this.setState({ visible: false }); }}
          refresh={this.refresh}
        />
      </div>
    );
  }
}

export default Account;