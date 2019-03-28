import React, { Component } from 'react';
import { Table } from 'antd';
import { colFormat } from '@util/index';
import Apis from '../../../../../util/request';
import moment from 'moment';
import { withRouter } from 'react-router';
import style from './index.less';
import CommonModal from './modal/common';
import StatusModal from './modal/status';
import GradientModal from './modal/gradient';
import InputModal from './modal/input';
import RegionModal from './modal/region';

@withRouter
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      visible: {},
      target: {},
      columns: [],
      rowData: {},
    };
  }

  componentDidMount = () => {
    const columnsConfig = window.INIT_CONFIG.expenseConfig.CommonService[this.props.match.params.service].columns;
    const columns = Object.keys(columnsConfig).map(key => {
      return colFormat(columnsConfig[key].name, key, (_, rowData) => {
        let visible = {};
        if (columnsConfig[key].type) {
          visible[columnsConfig[key].type] = !this.state.visible[columnsConfig[key].type];
        } else {
          visible.common = !this.state.visible.common;
        }
        return <a
          onClick={()=>{
            this.setState({
              target: key,
              rowData,
              visible: {
                ...this.state.visible,
                ...visible
              }
            });
          }}
        >点击编辑</a>;
      });
    });

    this.setState({
      columns: [this.columns[0],...columns,this.columns[1],this.columns[2]]
    });
    this.getDate();
  }

  getDate = async () => {
    const data = await Apis.ListProduct({ ProductGroupId: this.props.match.params.ID, Limit: '999' });
    this.setState({
      data
    });
  }

  columns = [
    colFormat('商品ID/计费项', 'Id', id => {
      if (id.length >= 10) {
        return id.slice(0,3) + '...' + id.slice(id.length - 3, id.length);
      }
    }),
    colFormat('状态', 'Status', (status, rowData) => {
      return <div className={style.tableCell} onClick={() => {
        this.setState({
          rowData,
          visible: {
            ...this.state.visible,
            status: !this.state.visible.status,
          }
        });
      }}>
        <a>{window.INIT_CONFIG.expenseConfig.ProductStatus[status]}</a>
      </div>;
    }),
    colFormat('更新时间', 'UpdateTime', time => {
      return  moment.unix(time).format('YYYY-MM-DD HH:mm:ss');
    }),
  ]

  render() {
    return (
      <div>
        <Table
          rowKey="Id"
          dataSource={this.state.data.ProductMetadatas}
          columns={this.state.columns}
          pagination={false}
        />
        <StatusModal
          visible={this.state.visible.status}
          data={this.state.rowData}
          update={this.getDate}
        />
        <CommonModal
          visible={this.state.visible.common}
          target={this.state.target}
          data={this.state.rowData}
          update={this.getDate}
        />
        <GradientModal
          visible={this.state.visible.gradient}
          target={this.state.target}
          data={this.state.rowData}
          update={this.getDate}
        />
        <InputModal
          visible={this.state.visible.input}
          target={this.state.target}
          data={this.state.rowData}
          update={this.getDate}
        />
        <RegionModal
          visible={this.state.visible.region}
          target={this.state.target}
          data={this.state.rowData}
          update={this.getDate}
        />
      </div>
    );
  }
}

export default Product;