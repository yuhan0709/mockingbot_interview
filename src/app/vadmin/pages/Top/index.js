import React, { Component } from 'react';
import { Table,message, Button } from 'antd';
import moment from 'moment';
import TableControlButton from '@component/TableControlButton';
import style from './index.less';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TopActions from '../../redux/actions/Top';
import ServiceForm from './serviceForm';
import Link from '@component/Link';

@connect((state)=>{
  return {
    services: state.Top.Services,
  };
}, (dispatch) => ({
  actions: bindActionCreators(TopActions, dispatch)
}))
class Top extends Component {
  constructor(props) {
    super(props);
    this.state = {
      serviceForm: {},
      limit: 10,
      offset: 0,
    };
  }

  async componentDidMount() {
    await this.props.actions.getServices();
  }

  hideServiceForm = () => {
    this.setState({ serviceForm: { ...this.state.serviceForm, visible: false } });
  }

  // 分页
  onPaginationChange = async (pageNumber) => {
    const Limit = this.props.services.Limit;
    const Offset = (pageNumber - 1) * Limit;
    this.setState({
      limit: Limit, offset: Offset
    });
    await this.props.actions.getServices({ Limit, Offset });
  }

  // 编辑
  edit = async (_, data) => {
    this.setState({ serviceForm: {
      key: +new Date(),
      visible: true,
      isEdit: true,
      service: data,
      confirmLoading: false,
      initialValueMap: {
        Psm: data.Psm,
        Owner: data.Owner,
        ServiceName: data.ServiceName,
        ServiceShortName: data.ServiceShortName,
        Status: data.Status,
      }
    } });
  }

  clickCreateBusiness = async () => {
    this.setState({ serviceForm: {
      key: +new Date(),
      visible: true,
      isEdit: false,
      confirmLoading: false,
      initialValueMap: {
        Psm: '',
        Owner: '',
        ServiceName: '',
        Status: 'offline',
      }
    } });
  }

  editService = async (data) => {
    this.setState({ serviceForm: { ...this.state.serviceForm, confirmLoading: true } });
    try {
      const initStatus = this.state.serviceForm.initialValueMap.Status;
      await this.props.actions.editService(data);
      if (data.Status !== initStatus && data.Status === 'online') {
        await this.props.actions.publishService(data);
      }
      this.setState({ serviceForm: { ...this.state.serviceForm, visible: false, confirmLoading: false } });
      await this.props.actions.getServices({ Limit: this.state.limit, Offset: this.state.offset });
      message.success('编辑成功');
    } catch (e) {
      this.setState({ serviceForm: { ...this.state.serviceForm, confirmLoading: false } });
      message.error('编辑失败');
    }
  }

  createService = async (data) => {
    this.setState({ serviceForm: { ...this.state.serviceForm, confirmLoading: true } });
    try {
      delete data.Status;
      await this.props.actions.createService(data);
      this.setState({ serviceForm: { ...this.state.serviceForm, visible: false, confirmLoading: false } });
      await this.props.actions.getServices({ Limit: this.state.limit, Offset: this.state.offset });
      message.success('新建成功');
    } catch (e) {
      console.log(e);
      this.setState({ serviceForm: { ...this.state.serviceForm, confirmLoading: false } });
      message.error('新建失败');
    }
  }

  render() {
    const columns = [
      {
        title: '服务名',
        dataIndex: 'ServiceName',
        key: 'ServiceName',
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
      },
      {
        title: '已注册API数',
        dataIndex: 'ApiCount',
        key: 'ApiCount',
      },
      {
        title: '已发布API数',
        dataIndex: 'PublishedApiCount',
        key: 'PublishedApiCount',
      },
      {
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
              key="edit"
              onClick={this.edit}>
              编辑
            </TableControlButton>,
            <Link key='apiManage' className={style.control} to={`./api/${rowData.ServiceId}/`}>API管理</Link>,
            <Link key='keyManage' className={style.control} to={`./key/${rowData.ServiceId}/`}>密钥管理</Link>,
            <Link key='Resource' className={style.control} to={`./resource/${rowData.ServiceId}/?ssname=${rowData.ServiceShortName}`}>资源管理</Link>
          ];
          return buttons;
        }
      }];
    const pagination = {
      showQuickJumper: true,
      current: Math.floor(this.props.services.Offset / this.props.services.Limit) + 1,
      pageSize: this.props.services.Limit,
      total: this.props.services.Total,
      onChange: this.onPaginationChange,
      showTotal: total => `共有 ${total} 条数据，每页显示：${this.props.services.Limit} 条`
    };
    return (
      <div>
        <Button className={style.create} type="primary" onClick={this.clickCreateBusiness}>+新建Top</Button>
        <Table
          rowKey="ServiceId"
          dataSource={this.props.services.List}
          columns={columns}
          pagination={pagination}
        />
        <ServiceForm
          onOk={this.state.serviceForm.isEdit ? this.editService : this.createService}
          onCancel={this.hideServiceForm}
          {...this.state.serviceForm}
        />
      </div>
    );
  }
}

export default Top;