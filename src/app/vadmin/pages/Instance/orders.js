import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Table } from 'antd';
import moment from 'moment';

class Orders extends Component {
  static propTypes = {
    id: PropTypes.string,
    visible: PropTypes.bool,
    dataSource: PropTypes.object,
    onCancel: PropTypes.func,
    onPaginationChange: PropTypes.func
  }
  static defaultProps = {
    id: undefined,
    dataSource: {},
    visible: false,
    onCancel: () => {},
    onPaginationChange: () => {},
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
  }

  handlePaginationChange = async (pageNumber) => {
    const Limit = this.props.dataSource.Limit;
    const Offset = (pageNumber - 1) * Limit;
    this.props.onPaginationChange({ Limit, Offset,InstanceIds: this.props.id });
  }

  render() {
    const columns = [
      {
        title: '订单号',
        dataIndex: 'Id',
        key: 'Id',
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
        title: '订单类型',
        dataIndex: 'OrderType',
        key: 'OrderType',
        render: type => window.INIT_CONFIG.expenseConfig.OrderType[type]
      },
      {
        title: '下单时间',
        dataIndex: 'CreateTime',
        key: 'CreateTime',
        render: (time) => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '付款/开通时间',
        dataIndex: 'PayTime',
        key: 'PayTime',
        render: (time) => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')
      },
    ];
    const pagination = {
      showQuickJumper: true,
      current: Math.floor(this.props.dataSource.Offset / this.props.dataSource.Limit) + 1,
      pageSize: this.props.dataSource.Limit,
      total: this.props.dataSource.Total,
      onChange: this.handlePaginationChange,
      showTotal: total => `总共 ${total} 条数据，每页显示 ${this.props.dataSource.Limit} 条`
    };
    return (
      <Modal
        visible={this.props.visible}
        title="订单详情"
        onCancel={this.props.onCancel}
        footer={null}
        width={800}
      >
        <Table
          rowKey={'Id'}
          dataSource={this.props.dataSource.OrderMetadatas}
          columns={columns}
          pagination={pagination}
        />
      </Modal>
    );
  }
}

export default Orders;