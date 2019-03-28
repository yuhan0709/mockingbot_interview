import React, { Component } from 'react';
import { Table, Divider, DatePicker, Button, message } from 'antd';
import { colFormat } from '@util/index';
import Apis from '../../../../../../util/request';
import moment from 'moment';
import { withRouter } from 'react-router';
import style from './index.less';
import StatusModal from './modal/status';
import CDNModal from './modal/cdn';
import StorageModal from './modal/storage';
import ScreenshotModal from './modal/screenshot';
import TranscodeModal from './modal/transcode';
import Detail from './modal/detail/index';
import SearchInput from './searchInput';
import Navigate from '@util/navigate';

const billingMap = window.INIT_CONFIG.expenseConfig.billingMap;
const { RangePicker } = DatePicker;

@withRouter
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      visible: {},
      target: {},
      accountName: ''
    };
  }

  param = {}

  timeChange = data => {
    this.param.BeginTime = '';
    this.param.EndTime = '';
    if (data.length === 2) {
      this.param = {
        ...this.param,
        BeginTime: data[0].toISOString(),
        EndTime: data[1].toISOString()
      };
    }
  }

  componentDidMount = async () => {
    if (this.props.match.params.accountID !== 'add') {
      const res = await Apis.GetAccountInfo({ AccountId: this.props.match.params.accountID });
      if (res[0]) {
        this.setState({
          accountName: res[0].Identity
        });
      }
    }
    this.getDate();
  }

  getDate = async () => {
    let AccountId = this.props.match.params.accountID;
    AccountId = AccountId !== 'add' ? AccountId : 0;
    this.getTimes(AccountId);
    const data = await Apis.ListProduct({
      ProductGroupId: this.props.match.params.ID,
      Limit: '999',
      AccountId,
    });

    this.setData(data);
  }

  getTimes = async AccountId => {
    const data = await Apis.ListSpecialProductGroup({
      AccountIds: AccountId,
      ProductGroupId: this.props.match.params.ID,
      Limit: 999
    });
    const specialProductGroup = data.ProductGroupMetadatas[0];
    const times = [moment.unix(specialProductGroup.BeginTime),moment.unix(specialProductGroup.EndTime)];
    this.setState({
      times
    });
  }

  setData = data => {
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

  setTarget = target => {
    const data = { ...this.state.data };
    data.ProductMetadatas[data.ProductMetadatas.findIndex(pm => pm.Id === target.Id)] = target;
    this.setData(data);
  }

  save = async () => {
    if (!this.param.AccountId) {
      message.warning('请选择用户名');
    } else if (!this.param.BeginTime || !this.param.EndTime) {
      message.warning('请选择日期');
    } else {
      await Apis.CreateSpecialProductGroup({
        ProductGroupId: this.props.match.params.ID,
        ...this.param
      });
      const Info = this.state.data.ProductMetadatas;
      Info.forEach(pm => {
        pm.BillingMethodSet = pm.BillingMethodCombination;
        pm.ProductId = pm.Id;
      });
      await Apis.CreateProducts({
        ProductGroupId: this.props.match.params.ID,
        Info,
        AccountId: this.param.AccountId
      }).finally(() => {
        Navigate.replace(`../${this.param.AccountId}/`);
      });
    }
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
    const { accountID } = this.props.match.params;
    return (
      <div>
        用户名：
        <SearchInput
          value = {
            this.props.match.params.accountID !== 'add'
              ? (this.state.accountName ? this.state.accountName : this.props.match.params.accountID)
              : false
          }
          style={{ width: '200px',marginRight: '20px' }}
          placeholder='请输入用户名'
          onChange={AccountId => {
            this.param.AccountId = AccountId * 1;
          }}
        />
        线下合作周期：<RangePicker key={this.state.times} defaultValue={this.state.times} showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.timeChange}/>
        {accountID === 'add' && (
          <Button type="primary"
            style={{ marginLeft: '20px' }}
            onClick={this.save}
          >
            保存
          </Button>
        )}
        <br /> <br />
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
          setTarget={this.setTarget}
        />
        <CDNModal
          visible={this.state.visible.cdn}
          target={this.state.target}
          data={this.state.billingMethod}
          billingMap={billingMap.cdn}
          update={this.getDate}
          setTarget={this.setTarget}
        />
        <StorageModal
          visible={this.state.visible.storage}
          target={this.state.target}
          data={this.state.billingMethod}
          billingMap={billingMap.common}
          update={this.getDate}
          setTarget={this.setTarget}
        />
        <TranscodeModal
          visible={this.state.visible.transcode}
          target={this.state.target}
          data={this.state.billingMethod}
          billingMap={billingMap.common}
          update={this.getDate}
          setTarget={this.setTarget}
        />
        <ScreenshotModal
          visible={this.state.visible.screenshot}
          target={this.state.target}
          data={this.state.billingMethod}
          billingMap={billingMap.common}
          update={this.getDate}
          setTarget={this.setTarget}
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