import React, { Component } from 'react';
import { Table } from 'antd';
import 'antd/dist/antd.css';
import EditableForm from './EditableForm';

export default class FormTable extends Component {

  isEditing = key => {
    return this.props.editingKey.indexOf(key) > -1;
  };

  render() {
    const components = {
      body: EditableForm
    };
    const columns = this.props.columns.map((col) => {
      if (!col.getFieldDecorator) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          cell: col.cell,
          getFieldDecorator: col.getFieldDecorator,
          editing: this.isEditing(record.key),
        }),
      };
    });
    return <Table
      size="small"
      rowKey='key'
      rowClassName="editable-row"
      bordered
      pagination={false}
      {...this.props}
      components={components}
      columns={columns}
    />;
  }
}
