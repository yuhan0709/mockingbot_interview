import React, { PureComponent } from 'react';
import { Table } from 'antd';
import style from './index.less';
import EditModal from './editModal.js';
import TableControlButton from '@component/TableControlButton';
import moment from 'moment';
import Link from '@component/Link';

class table extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      editVisible: false,
      serviceVisible: false,
      target: {},
    };
  }

  onPaginationChange = (current, size) => {
    if (!size) {
      return;
    }
    const Limit = size;
    const Offset = (current - 1) * size;
    this.props.getData({ Limit, Offset });
  }

  hideModal = () => {
    this.setState({
      editVisible: false,
      serviceVisible: false,
    });
  }

  render() {
    const columns = [
      colFormat('用户ID', 'Id'),
      colFormat('用户名', 'Identity'),
      colFormat('手机号', 'Tel', tel => (
        tel ? tel : '--'
      )),
      colFormat('邮箱', 'Email'),
      colFormat('状态', 'Status', () => {
        return '未实名认证';
      }),
      // colFormat('云服务', 'CreateDate',(_, rowData) => {
      //   let value = '';
      //   if (rowData.Tags){
      //     rowData.Tags.forEach(ele => {
      //       let key = ele.TagKey;
      //       key = this.state.serviceMap[key] ? this.state.serviceMap[key] : key;
      //       value += key + ',';
      //     });
      //   }
      //   if (value.length) {
      //     value = value.slice(0, value.length - 1 );
      //   }
      //   return value;
      // }),
      colFormat('注册时间', 'UpdatedTime', time => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')),
      colFormat('操作', 'Operate', (_, rowData) => {
        const buttons = [
          <TableControlButton
            className={style.control}
            data={rowData}
            key="edit"
            onClick={(_, rowData) => {
              this.setState({
                target: rowData,
                editVisible: true,
              });
            }}>
            编辑
          </TableControlButton>
          ,
          <Link className={style.control} key="basics" to={`./${rowData.Id}/`}>
            详情
          </Link>];
        if (this.props.judgeSuper(rowData.Id)) {
          buttons.push(
            <TableControlButton
              className={style.control}
              data={rowData}
              key="login"
              onClick={(_, rowData) => {
                this.props.assumeAccount(rowData);
              }}>
              扮演该用户
            </TableControlButton>
          );
        }
        return buttons;
      }),
    ];
    const pagination = {
      showQuickJumper: true,
      current: Math.floor(this.props.data.Offset / this.props.data.Limit) + 1,
      pageSize: this.props.data.Limit,
      total: this.props.data.Total,
      onChange: this.onPaginationChange,
      showTotal: total => `共有 ${total} 条数据，每页显示：${this.props.data.Limit} 条`
    };

    return (
      <div>
        <Table
          rowKey='Id'
          dataSource={this.props.data.List}
          columns={columns}
          pagination={pagination}
        />
        <EditModal
          visible={this.state.editVisible}
          target={this.state.target}
          hideModal={this.hideModal}
          refresh={this.props.refresh}
        />
      </div>
    );
  }
}

function colFormat(title, key, render) {
  const res = {
    title: title,
    dataIndex: key,
    key: key,
  };
  if (render) {
    res['render'] = render;
  }
  return res;
}


export default table;