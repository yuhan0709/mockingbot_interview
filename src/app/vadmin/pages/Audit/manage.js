import React, { Component } from 'react';
import { Table, Divider } from 'antd';
import { colFormat } from '@util/index';
import Apis from '../../util/request';
import TableControlButton from '@component/TableControlButton';
import AuditModal from './auditModal';
import DetailModal from './detailModal';
import { withRouter } from 'react-router';

@withRouter
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      auditModalVisible: false,
      auditModalData: {},
      detailModalVisible: false,
    };
  }

  componentDidMount = async () => {
    this.getData();
  }

  getData = async () => {
    const data = await Apis.SelectAllByService({ Service: this.props.match.params.serviceName });
    data.forEach(ele => {
      ele.details && (ele.details = JSON.parse(ele.details));
    });
    this.setState({
      data: data
    });
  }

  columns = [
    colFormat('用户ID', 'idx_user_id'),
    colFormat('用户名', 'user_name'),
    colFormat('状态', 'status', status => {
      return ['通过', '未通过', '待审核'][status];
    }),
    colFormat('最新提交时间', 'create_time'),
    colFormat('最新处理时间', 'update_time', ut => {
      return ut ? ut : '--';
    }),
    colFormat('操作', 'chosen', (_, rowData) => {
      return (
        <span>
          <TableControlButton
            data={rowData}
            key="manage"
            onClick={() => {
              this.setState({
                auditModalData: rowData,
                auditModalVisible: !this.state.auditModalVisible,
              });
            }}
          >
            审核
          </TableControlButton>
          <Divider type="vertical" />
          <TableControlButton
            data={rowData}
            key="detail"
            onClick={() => {
              this.setState({
                detailModalData: rowData.id,
                detailModalVisible: !this.state.detailModalVisible
              });
            }}
          >
            审核详情
          </TableControlButton>
        </span>
      ); })
  ]

  render() {
    const pagination = {
      showQuickJumper: true,
      pageSize: 10,
      total: this.state.data.length,
      showTotal: () => `共有 ${this.state.data.length} 条数据，每页显示 10 条`
    };
    return (
      <div>
        <Table
          rowKey="id"
          dataSource={this.state.data}
          columns={this.columns}
          pagination={pagination}
        />
        <AuditModal
          refresh={() => {
            this.getData();
          }}
          visible={this.state.auditModalVisible}
          data={this.state.auditModalData}
        />
        <DetailModal
          visible={this.state.detailModalVisible}
          auditId={this.state.detailModalData}
        />
      </div>
    );
  }
}

export default Product;