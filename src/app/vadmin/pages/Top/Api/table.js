import React, { PureComponent } from 'react';
import { Table } from 'antd';
import moment from 'moment';
import TableControlButton from '@component/TableControlButton';
import style from './index.less';
import PropTypes from 'prop-types';
import ApiForm from './ApiForm';
import ApiHeader from './ApiHeader';
import Link from '@component/Link';

class ApiTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      apiForm: {},
    };
  }

  static propTypes = {
    selectedKeys: PropTypes.array,
    onSelect: PropTypes.func,
    onPaginationChange: PropTypes.func,
    apis: PropTypes.object,
    addApi: PropTypes.func,
    editApi: PropTypes.func,
    viewAPi: PropTypes.func,
    publishApi: PropTypes.func,
    searchApi: PropTypes.func
  }
  static defaultProps = {
    selectedKeys: [],
    onSelect: ()=>{},
    onPaginationChange: ()=>{},
    apis: [],
    addApi: () => {},
    editApi: () => {},
    publishApi: () => {},
    viewAPi: () => {},
    searchApi: ()=>{}
  }

  onPaginationChange = async (pageNumber) => {
    const limit = this.props.apis.Limit;
    const offset = (pageNumber - 1) * limit;
    this.props.onPaginationChange({ limit, offset });
  }

  componentDidMount() {
  }
  //
  view = (_, data) => {
    this.setState({ apiForm: {
      key: +new Date(),
      visible: true,
      isView: true,
      api: data,
      disabledOnline: false,
      confirmLoading: false,
      initialValueMap: { ...data }
    } });
  }

  edit = (_, data) => {
    this.setState({ apiForm: {
      key: +new Date(),
      visible: true,
      isEdit: true,
      api: data,
      disabledOnline: false,
      confirmLoading: false,
      initialValueMap: { ...data }
    } });
  }

  editApi = async (data) => {
    this.setState({ apiForm: { ...this.state.apiForm, confirmLoading: true } });
    try {
      await this.props.editApi(data);
      this.setState({ apiForm: { ...this.state.apiForm, visible: false, confirmLoading: false } });
    } catch (e) {
      this.setState({ apiForm: { ...this.state.apiForm, confirmLoading: false } });
    }
  }

  hideApiForm = () => {
    this.setState({ apiForm: { ...this.state.apiForm, visible: false } });
  }

  render() {
    const columns = [
      {
        title: 'API名称',
        dataIndex: 'ApiName',
        key: 'ApiName',
      },
      {
        title: 'Action',
        dataIndex: 'Action',
        key: 'Action',
      },
      {
        title: '版本',
        dataIndex: 'Version',
        key: 'Version',
      },
      {
        title: '状态',
        dataIndex: 'Status',
        key: 'Status',
        render: (status,rowData) => {
          if (status === 'offline'){
            return '待发布';
          }
          return rowData.PublishTime === rowData.UpdateTime ? '已发布' : '更新待发布';
        }
      },{
        title: '最新发布时间',
        dataIndex: 'PublishTime',
        key: 'PublishTime',
        render: (time) => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '操作',
        key: 'Op',
        render: (_, rowData) => {
          const buttons = [
            <TableControlButton
              className={style.control}
              data={rowData}
              key="preview"
              onClick={this.view}>
              查看
            </TableControlButton>,
            <TableControlButton
              className={style.control}
              data={rowData}
              key="edit"
              onClick={this.edit}>
              编辑
            </TableControlButton>,
            <Link key='apiManage' className={style.control} to={`./${rowData.ApiId}/`}>API参数管理</Link>];
          return buttons;
        }
      }];
    const pagination = {
      showQuickJumper: true,
      current: Math.floor(this.props.apis.Offset / this.props.apis.Limit) + 1,
      pageSize: this.props.apis.Limit,
      total: this.props.apis.Total,
      onChange: this.onPaginationChange,
      showTotal: total => `共有 ${total} 条数据，每页显示：${this.props.apis.Limit} 条`
    };
    const rowSelection = {
      onChange: (selectedRowKeys) => {
        this.props.onSelect(selectedRowKeys);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
      selectedRowKeys: this.props.selectedKeys
    };
    return (
      <div>
        <ApiHeader addApi={this.props.addApi} publishApi={this.props.publishApi} searchApi={this.props.searchApi}/>
        <Table
          rowKey="ApiId"
          dataSource={this.props.apis.List}
          columns={columns}
          pagination={pagination}
          rowSelection={rowSelection}
        />
        <ApiForm
          onOk={this.editApi}
          onCancel={this.hideApiForm}
          {...this.state.apiForm}
        />
      </div>
    );
  }
}

export default ApiTable;