import React, { Component } from 'react';
import { Table, Modal } from 'antd';
import { colFormat } from '@util/index';
import Apis from '../../util/request';
import TableControlButton from '@component/TableControlButton';
import MessageModal from './messageModal';

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      visible: false,
      modalVisible: false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible){
      this.setState({
        visible: true,
        modalVisible: false,
      });
      this.getData(nextProps.auditId);
    }
  }

  getData = async idx_audit_id => {
    const data = await Apis.SelectAuditDetailByAuditId({ idx_audit_id });
    this.setState({
      data,
    });
  }

  longStr(str) {
    if (!str) {
      return '--';
    }
    if (str.length > 10) {
      return <span title={str}>{str.slice(0,8) + '...'}</span>;
    }
    return str;
  }

  columns = [
    colFormat('审核人ID', 'user_id'),
    colFormat('审核人', 'user_name'),
    colFormat('审核状态', 'status', status => {
      return ['通过', '未通过', '待审核'][status];
    }),
    colFormat('未通过理由', 'refuse_reason', rr => {
      return this.longStr(rr);
    }),
    colFormat('处理时间', 'create_time'),
    colFormat('备注', 'description', desc => {
      return this.longStr(desc);
    }),
    colFormat('操作', 'chosen', (_, rowData) => {
      return (
        <TableControlButton
          data={rowData}
          key="detail"
          onClick={() => {
            this.setState({
              modalVisible: true,
              modalDetails: JSON.parse(rowData.details)
            });
          }}
        >
            查看详情
        </TableControlButton>
      ); })
  ]

  handleCancel = () => {
    this.setState({
      visible: false
    });
  }

  render() {
    return (
      <Modal
        width={1000}
        title="审核详情"
        visible={this.state.visible}
        onCancel={this.handleCancel}
        footer={null}
      >
        <Table
          rowKey="id"
          dataSource={this.state.data}
          columns={this.columns}
          pagination={false}
        />
        <MessageModal
          visible={this.state.modalVisible}
          details={this.state.modalDetails}
          onCancel={() => {
            this.setState({
              modalVisible: false
            });
          }}
        />
      </Modal>
    );
  }
}

export default Product;