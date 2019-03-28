import React, { Component } from 'react';
import { Table } from 'antd';
import PropTypes from 'prop-types';

/**
 * DataTable 统一pagination的Table组件
 */
class DataTable extends Component {
  static propTypes = {
    current: PropTypes.number.isRequired,
    Limit: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    onChange: PropTypes.func,
    loading: PropTypes.bool
  }
  static defaultProps = {
    current: 1,
    Limit: 10,
    total: 0,
    loading: false,
    onChange: () => {}
  }
  state = {
  };
  componentDidMount() {
  }
  render() {
    const pagination = {
      showQuickJumper: true,
      current: this.props.current,
      pageSize: this.props.Limit,
      total: this.props.total,
      onChange: this.props.onChange,
      showTotal: () => `共有 ${this.props.total} 条数据，每页显示 ${this.props.Limit} 条`
    };
    return (
      <Table
        dataSource={this.props.dataSource}
        columns={this.props.columns}
        rowKey={this.props.rowKey}
        pagination={pagination}
        loading={this.props.loading}
      ></Table>
    );
  }
}

export default DataTable;