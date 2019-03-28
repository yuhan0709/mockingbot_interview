import React, { PureComponent } from 'react';
import { Table } from 'antd';
import Form from './form';
import Orders from './orders';
import moment from 'moment';
import TableControlButton from '@component/TableControlButton';
import style from './index.less';
import PropTypes from 'prop-types';

class InstanceTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
      showOrders: false,
      selectedId: undefined,
    };
  }

  static propTypes = {
    dataSource: PropTypes.object,
    orders: PropTypes.object,
    rowKey: PropTypes.string,
    onPaginationChange: PropTypes.func,
    onEdit: PropTypes.func,
    onShowOrders: PropTypes.func
  }
  static defaultProps = {
    dataSource: {},
    orders: {},
    rowKey: 'ID',
    onPaginationChange: () => {
    },
    onEdit: () => {
    },
    onShowOrders: () => {
    }
  }

  onPaginationChange = async (pageNumber) => {
    const Limit = this.props.dataSource.Limit;
    const Offset = (pageNumber - 1) * Limit;
    this.props.onPaginationChange({ Limit, Offset });
  }

  // 订单详情
  orderView = (_, data) => {
    this.setState({
      showOrders: true,
      selectedId: data.Id
    });
    this.getOrders({
      Limit: 20,
      Offset: 0,
      InstanceIds: data.Id
    });
  }

  getOrders = (param) => {
    this.props.onShowOrders(param);
  }

  hideOrders = () => {
    this.setState({ showOrders: false, selectedId: undefined });
  }

  // 实例管理
  instanceManage = (_, data) => {
    this.setState({
      form: {
        key: +new Date(),
        visible: true,
        isEdit: true,
        dataSource: data,
        disabledOnline: false,
        confirmLoading: false,
        initialValueMap: { ...data }
      }
    });
  }

  edit = async (data) => {
    this.setState({ form: { ...this.state.form, confirmLoading: true } });
    try {
      await this.props.onEdit(data);
      this.setState({ form: { ...this.state.form, visible: false, confirmLoading: false } });
    } catch (e) {
      this.setState({ form: { ...this.state.form, confirmLoading: false } });
    }
  }

  hideForm = () => {
    this.setState({ form: { ...this.state.form, visible: false } });
  }

  render() {
    const columns = [
      {
        title: '用户ID',
        dataIndex: 'Identity',
        key: 'Identity',
      },
      {
        title: '实例编号',
        dataIndex: 'Id',
        key: 'Id',
      },
      {
        title: '商品ID',
        dataIndex: 'ProductId',
        key: 'ProductId',
      },
      {
        title: '产品名称',
        dataIndex: 'Service',
        key: 'Service',
        render: name => {
          return window.INIT_CONFIG.expenseConfig.Service[name];
        }
      },
      {
        title: '创建时间',
        dataIndex: 'CreateTime',
        key: 'CreateTime',
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
              key="view"
              onClick={this.orderView}>
              订单详情
            </TableControlButton>,
            <TableControlButton
              className={style.control}
              data={rowData}
              key="manage"
              onClick={this.instanceManage}>
              实例管理
            </TableControlButton>];
          return buttons;
        }
      }];
    const pagination = {
      showQuickJumper: true,
      current: Math.floor(this.props.dataSource.Offset / this.props.dataSource.Limit) + 1,
      pageSize: this.props.dataSource.Limit,
      total: this.props.dataSource.Total,
      onChange: this.onPaginationChange,
      showTotal: total => `总共 ${total} 条数据，每页显示 ${this.props.dataSource.Limit} 条`
    };

    return (
      <div>
        <Table
          rowKey={this.props.rowKey}
          dataSource={this.props.dataSource.Instances}
          columns={columns}
          pagination={pagination}
        />
        <Form
          onOk={this.edit}
          onCancel={this.hideForm}
          {...this.state.form}
        />
        <Orders
          visible={this.state.showOrders}
          onCancel={this.hideOrders}
          dataSource={this.props.orders}
          id={this.state.selectedId}
          onPaginationChange={this.getOrders}
        />
      </div>
    );
  }
}

export default InstanceTable;