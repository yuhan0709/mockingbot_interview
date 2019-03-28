import React, { PureComponent } from 'react';
import { Table } from 'antd';
import Form from './form';
import Header from './header';
import TableControlButton from '@component/TableControlButton';
import style from './index.less';
import PropTypes from 'prop-types';

class ApiParam extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
    };
  }

  static propTypes = {
    onPaginationChange: PropTypes.func,
    dataSource: PropTypes.object,
    rowKey: PropTypes.string,
    add: PropTypes.func,
    edit: PropTypes.func,
    delete: PropTypes.func,
    search: PropTypes.func
  }
  static defaultProps = {
    onPaginationChange: () => {
    },
    dataSource: {},
    rowKey: 'ID',
    add: () => {},
    edit: () => {},
    delete: ()=>{},
    search: () => {}
  }

  onPaginationChange = async (pageNumber) => {
    const limit = this.props.dataSource.Limit;
    const offset = (pageNumber - 1) * limit;
    this.props.onPaginationChange({ limit, offset });
  }

  showForm = (data) => {
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
      await this.props.edit(data);
      this.setState({ form: { ...this.state.form, visible: false, confirmLoading: false } });
    } catch (e) {
      this.setState({ form: { ...this.state.form, confirmLoading: false } });
    }
  }

  delete = async (data) => {
    this.props.delete(data);
  }

  hideForm = () => {
    this.setState({ form: { ...this.state.form, visible: false } });
  }

  render() {
    const columns = [
      {
        title: '参数名',
        dataIndex: 'Key',
        key: 'Key',
      },
      {
        title: '类型',
        dataIndex: 'Type',
        key: 'Type',
      },
      {
        title: '是否数组',
        dataIndex: 'IsArray',
        key: 'IsArray',
        render: item => item ? '是' : '否'
      },
      {
        title: '是否代表ResourceID',
        dataIndex: 'IsResource',
        key: 'IsResource',
        render: item => item ? '是' : '否'
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
              onClick={()=>this.showForm(rowData)}>
              编辑
            </TableControlButton>,
            <TableControlButton
              className={style.control}
              data={rowData}
              key="delete"
              onClick={()=>this.delete(rowData)}>
              删除
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
        <Header add={this.props.add} search={this.props.search}/>
        <Table
          rowKey={this.props.rowKey}
          dataSource={this.props.dataSource.List}
          columns={columns}
          pagination={pagination}
        />
        <Form
          onOk={this.edit}
          onCancel={this.hideForm}
          {...this.state.form}
        />
      </div>
    );
  }
}

export default ApiParam;