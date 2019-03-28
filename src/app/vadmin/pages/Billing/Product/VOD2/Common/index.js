import React, { Component } from 'react';
import { Table, Divider } from 'antd';
import { colFormat } from '@util/index';
import Apis from '../../../../../util/request';
import moment from 'moment';
import { withRouter } from 'react-router';
import style from './index.less';
import StatusModal from './modal/status';
import CDNModal from './modal/cdn';
import StorageModal from './modal/storage';
import ScreenshotModal from './modal/screenshot';
import TranscodeModal from './modal/transcode';
import Detail from './modal/detail/index';

const billingMap = window.INIT_CONFIG.expenseConfig.billingMap;
@withRouter
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      visible: {},
      target: {},
    };
  }

  componentDidMount = () => {
    this.getDate();
  }

  getDate = async () => {
    const data = await Apis.ListProduct({ ProductGroupId: 'vod', Limit: '999' });
    data.ProductMetadatas.forEach(pm => {
      const storage = pm.BillingMethodCombination[pm.BillingMethodCombination.findIndex(bm => bm.Key === 'Storage')];
      const cdn = pm.BillingMethodCombination[pm.BillingMethodCombination.findIndex(bm => bm.Key === 'CDN')];
      const transcode = pm.BillingMethodCombination[pm.BillingMethodCombination.findIndex(bm => bm.Key === 'Transcode')];
      const screenshot = pm.BillingMethodCombination[pm.BillingMethodCombination.findIndex(bm => bm.Key === 'Screenshot')];
      pm.BillingMethodMap = {
        storage,
        cdn,
        transcode,
        screenshot
      };
    });
    this.setState({
      data
    });
  }

  cdnCli = (billingMethod, target) => {
    this.setState({
      billingMethod,
      target,
      visible: {
        ...this.state.visible,
        cdn: !this.state.visible.cdn,
      },
    });
  }

  columns = [
    colFormat('商品ID/计费项', 'Id', id => {
      if (id.length >= 10) {
        return id.slice(0,3) + '...' + id.slice(id.length - 3, id.length);
      }
    }),
    colFormat('视频分发', 'a', (_, target) => {
      const billing = target.BillingMethodMap.cdn;
      const inner = billing.Value[billing.Value.findIndex(val => val.Key === 'inner')];
      const abroad = billing.Value[billing.Value.findIndex(val => val.Key === 'abroad')];
      return <div>
        <a onClick={()=>{ this.cdnCli(inner, target); }}> 国内：{billingMap.cdn[target.SettlementPeriod][inner.Func.FuncName]} </a> <br />
        <Divider style={{ margin: '12px 0' }} type="horizontal" />
        <a onClick={()=>{ this.cdnCli(abroad, target); }}>国外：{billingMap.cdn[target.SettlementPeriod][abroad.Func.FuncName]} </a>
      </div>;
    }),
    colFormat('视频存储', 'b', (_, target) => {
      const billing = target.BillingMethodMap.storage;
      return <a onClick={() => {
        this.setState({
          billingMethod: billing,
          target,
          visible: {
            ...this.state.visible,
            storage: !this.state.visible.storage,
          }
        });
      }}>{billingMap.common[target.SettlementPeriod]}</a>;
    }),
    colFormat('视频转码', 'c', (_, target) => {
      const billing = target.BillingMethodMap.transcode;
      return <a onClick={() => {
        this.setState({
          billingMethod: billing,
          target,
          visible: {
            ...this.state.visible,
            transcode: !this.state.visible.transcode,
          }
        });
      }}>{billingMap.common[target.SettlementPeriod]}</a>;
    }),
    colFormat('视频截图', 'd', (_, target) => {
      const billing = target.BillingMethodMap.screenshot;
      return <a onClick={() => {
        this.setState({
          billingMethod: billing,
          target,
          visible: {
            ...this.state.visible,
            screenshot: !this.state.visible.screenshot,
          }
        });
      }}>{billingMap.common[target.SettlementPeriod]}</a>;
    }),
    colFormat('状态', 'Status', (status, target) => {
      return <div className={style.tableCell} onClick={() => {
        this.setState({
          target,
          visible: {
            ...this.state.visible,
            status: !this.state.visible.status,
          }
        });
      }}>
        <a>{window.INIT_CONFIG.expenseConfig.ProductStatus[status]}</a>
      </div>;
    }),
    colFormat('操作', 'chosen', (_, target) => {
      return (
        <a onClick={() => {
          this.setState({
            target,
            visible: {
              ...this.state.visible,
              detail: !this.state.visible.detail,
            }
          });
        }}>查看</a>
      ); }),
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
          columns={this.columns}
          pagination={false}
        />
        <StatusModal
          visible={this.state.visible.status}
          target={this.state.target}
          update={this.getDate}
        />
        <CDNModal
          visible={this.state.visible.cdn}
          target={this.state.target}
          data={this.state.billingMethod}
          billingMap={billingMap.cdn}
          update={this.getDate}
        />
        <StorageModal
          visible={this.state.visible.storage}
          target={this.state.target}
          data={this.state.billingMethod}
          billingMap={billingMap.common}
          update={this.getDate}
        />
        <TranscodeModal
          visible={this.state.visible.transcode}
          target={this.state.target}
          data={this.state.billingMethod}
          billingMap={billingMap.common}
          update={this.getDate}
        />
        <ScreenshotModal
          visible={this.state.visible.screenshot}
          target={this.state.target}
          data={this.state.billingMethod}
          billingMap={billingMap.common}
          update={this.getDate}
        />
        <Detail
          visible={this.state.visible.detail}
          target={this.state.target}
          billingMap={billingMap}
        />
      </div>
    );
  }
}

export default Product;