import React, { PureComponent } from 'react';
import { Table } from 'antd';
// import style from './index.less';
import ResourceModal from './resourceModal.js';
import TableControlButton from '@component/TableControlButton';

class table extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      target: {},
      ResourceTypeIds: ''
    };
  }

  onPaginationChange = (current, size) => {
    if (!size){
      return;
    }
    const Limit = size;
    const Offset = (current - 1) * size;
    this.props.getData({ Limit, Offset });
  }

  hideModal = () => {
    this.setState({
      visible: false,
    });
  }

  render() {
    const columns = [
      colFormat('资源ID', 'ResourceTypeId'),
      colFormat('资源中文名称', 'ResourceNameCn'),
      colFormat('资源英文名称', 'ResourceName'),
      colFormat('状态', 'Status',(_, rowData) => {
        return rowData.Status === 'online'
          ? rowData.UpdateTime > rowData.PublishTime ? '更新待发布' : '已发布'
          : '待发布';
      }),
      colFormat('可归属于项目', 'IsProjectResource',(_, rowData) => {
        return rowData.IsProjectResource ? '是' : '否';
      }),
      colFormat('与region相关', 'IsRegionResource',(_, rowData) => {
        return rowData.IsRegionResource ? '是' : '否';
      }),
      colFormat('TRN', 'Pattern'),
      colFormat('操作', 'Operate', (_, rowData) => {
        const buttons = [
          <TableControlButton
            // className={style.control}
            data={rowData}
            key="edit"
            onClick={(_,rowData) => {
              this.setState({
                target: rowData,
                visible: true,
              });
            }}>
            编辑
          </TableControlButton>];
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

    const rowSelection = {
      onChange: this.props.onChange,
      selectedRowKeys: this.props.selectedRowKeys
    };

    return (
      <div>
        <Table
          rowSelection={rowSelection}
          dataSource={this.props.data.List}
          columns={columns}
          pagination={pagination}
        />
        <ResourceModal
          title="编辑资源"
          ServiceId={this.props.ServiceId}
          visible={this.state.visible}
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