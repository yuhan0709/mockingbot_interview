import React, { Component } from 'react';
import { Table } from 'antd';

class DataTable extends Component {
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
        className={this.props.className}
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