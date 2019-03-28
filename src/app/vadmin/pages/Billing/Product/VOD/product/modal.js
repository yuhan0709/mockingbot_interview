import React, { Component } from 'react';
import { Modal, Table } from 'antd';
import Apis from '../../../../../util/request';

class QueryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      columns: [],
      query: {},
      data: {}
    };
  }

  UNSAFE_componentWillReceiveProps = async (nextProps) => {
    if (this.props.visible !== nextProps.visible) {
      this.setState({
        visible: true
      });
      const data = await this.getData(nextProps.data);
      const columns = [
        colFormat('productID', 'Id'),
      ];
      if (data.ProductMetadatas.length && data.ProductMetadatas[0].BillingMethodCombination.length) {
        let BillingMethodCombination = [];
        data.ProductMetadatas.forEach(pmt => {
          if (pmt.BillingMethodCombination.length > BillingMethodCombination.length) {
            BillingMethodCombination = pmt.BillingMethodCombination;
          }
        });
        BillingMethodCombination.forEach(bmc => {
          columns.push(
            colFormat(
              window.INIT_CONFIG.expenseConfig.BillingMethodCategory[bmc.Category],
              bmc.Category,
              id => {
                return window.INIT_CONFIG.expenseConfig.BillingMethodName[id];
              }
            )
          );
        });
      }
      this.setState({
        columns
      });
    }
  }

  getData = async (query) => {
    query = {
      ...this.state.query,
      ...query,
    };
    const data = await Apis.ListProductsByGroup(query);
    data.ProductMetadatas.forEach(product => {
      product.BillingMethodCombination.forEach(bmc => {
        product[bmc.Category] = bmc.BillingMethod.Id;
      });
    });
    this.setState({
      query,
      data
    });
    return data;
  }

  onChange = (current, size) => {
    const Limit = size;
    const Offset = (current - 1) * size;
    this.getData({ Limit,Offset });
  }

  render() {
    const pagination = {
      showQuickJumper: true,
      current: Math.floor(this.state.data.Offset / this.state.data.Limit) + 1,
      pageSize: this.state.data.Limit,
      total: this.state.data.Total,
      onChange: this.onChange
    };
    return (
      <div>
        <Modal
          title="查看商品"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={() => {
            this.setState({
              visible: false
            });
          }}
          footer={null}
        >
          <Table
            rowKey="Id"
            dataSource={this.state.data.ProductMetadatas}
            columns={this.state.columns}
            pagination={pagination}
          />
        </Modal>
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
export default QueryModal;