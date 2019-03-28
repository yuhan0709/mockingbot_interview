import React, { Component } from 'react';
import FormsTable from './index';
import { Select } from 'antd';

const Option = Select.Option;

export default class Example extends Component {
  state = {
    editingKey: [2],
    data: [{
      key: 1,
      Id: 1,
      Input: '111',
      Select: 0,
    },{
      key: 2,
      Id: 2,
      Input: '222',
      Select: 1,
    }],
  }

  columns = [
    {
      title: '没有框',
      dataIndex: 'Id',
      key: 'Id',
      width: 100,
    },{
      title: '默认框',
      dataIndex: 'Input',
      key: 'Input',
      getFieldDecorator: (form, record) => {
        this.forms[record.key] = form;
        const { getFieldDecorator } = form;
        return getFieldDecorator('Input', {
          rules: [{
            required: true,
            message: '请输入默认框',
          }],
          initialValue: record['Input'],
        });
      }
    },{
      title: '自定义框',
      dataIndex: 'Select',
      key: 'Select',
      render: select => {
        return ['下线', '上线'][select];
      },
      cell: (
        <Select style={{ width: 100 }}>
          <Option key='0' value='0'>下线</Option>
          <Option key='1' value='1'>上线</Option>
        </Select>
      ),
      getFieldDecorator: (form, record) => {
        this.forms[record.key] = form;
        const { getFieldDecorator } = form;
        return getFieldDecorator('Select');
      }
    },{
      title: 'form提交',
      dataIndex: 'Confirm',
      key: 'Confirm',
      render: (_, record) => {
        if (this.state.editingKey.indexOf(record.key) !== -1) {
          return <a onClick={()=>{
            this.forms[record.key].validateFields((error, row) => {
              console.log(error, row);
            });
          }}>
            提交
          </a>;
        }
        return '--';
      }
    }
  ]

  forms = {}

  render() {
    return <FormsTable
      columns={this.columns}
      editingKey={this.state.editingKey}
      dataSource={this.state.data}
    />;
  }
}
