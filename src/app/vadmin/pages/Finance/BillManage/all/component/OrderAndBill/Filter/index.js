import React, { Component } from 'react';
import { Select, DatePicker, Button, Input, Radio, Checkbox, TreeSelect, message, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import style from './style.less';
import smApis from '../../../../../../../../../server/api/public/serviceMeta';
import moment from 'moment';
import Apis from '../../../../../../../util/request';

const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;
const defaultMode = ['date', 'date'];
const monthMode = ['month', 'month'];
export function formatSm(data) {
  const formatData = {
    title: data.name,
    value: data.path,
    key: data.path
  };
  if (data.children) {
    Object.keys(data.children).forEach(key => {
      if (!formatData.children) {
        formatData.children = [];
      }
      formatData.children.push(formatSm(data.children[key]));
    });
  }
  return formatData;
}

export function addSmData(temp, smData) {
  for (let i = 0; i < temp.length; i++) {
    if (temp[i].value === smData.value) {
      temp[i].children = smData.children;
      return;
    }
    if (temp[i].children) {
      addSmData(temp[i].children, smData);
    }
  }
}

const expenseConfig = window.INIT_CONFIG.expenseConfig;

class Filter extends Component {
  static defaultProps = {
    services: [],
    status: {},
    hideZeroOrder: () => { },
    search: () => { },
    showAccountInput: true,
    showPayType: false,
    showHideTip: false,
    isBill: false
  }
  static propTypes = {
    services: PropTypes.array,
    isBill: PropTypes.bool
  }

  payType = 'post';

  constructor(props) {
    super(props);
    this.state = {
      filterObj: {
        PayType: 'post'
      },
      PayType: 'post',
      modalVisible: false,
      pickerValue: [],
      tagValues: [],
      selectTags: [],
      smId: 0,
      smData: [],
      ServiceTree: {}
    };
  }

  componentDidMount = async () => {
    let filterObj = {};
    if (this.props.productId) {
      filterObj.Services = this.props.productId.toString();
    }
    if (this.props.payStatus) {
      filterObj.Status = this.props.payStatus;
    }
    if (this.props.beginTime || this.props.endTime) {
      const beginTime = this.props.beginTime ? moment.unix(this.props.beginTime) : '';
      const endTime = this.props.endTime ? moment.unix(this.props.endTime) : '';
      this.handleDateChange([beginTime, endTime]);
    }

    let smId = 0;
    let smData = [];
    let ServiceTree = {};

    try {
      const res = await smApis.smIdChildrenTreeView({ id: smId, max_level: 1 });
      let parent = res.data[0];
      parent.path = 'all';
      parent.name = '全部';
      parent.children = res.data.splice(1);
      smData = [formatSm(parent)];
      ServiceTree.ServiceTree = smData[0].value;
    } catch (e) {
      console.log(e);
    }
    const PayType = {};
    if (this.props.payType) {
      PayType.PayType = this.props.payType;
      this.payType = this.props.payType;
    }

    if (this.props.serviceTree && this.props.serviceTree !== '|' && this.props.serviceTree !== '|root') {
      ServiceTree.ServiceTree = this.props.serviceTree;
      const treeArr = this.props.serviceTree.split('|');
      for (let i = 0; i < treeArr.length; i++) {
        const name = treeArr[i];
        if (!name) {
          continue;
        }
        let path = treeArr.slice(0, i + 1).join('|');
        smData = await this.setSmData({
          path,
          name
        }, smData);
      }
    }
    let params = {};
    if (this.props.name) {
      params = await this.getAccountIds(this.props.name);
    }
    this.setState({
      billIgnoreZero: !!this.props.ignoreZero,
      Customer: this.props.customer,
      smId,
      smData,
      ServiceTree,
      ...PayType,
      filterObj: {
        name: this.props.name,
        ...this.state.filterObj,
        ...filterObj,
        ...params
      }
    }, () => {
      this.search(this.state.filterObj, this.payType);
    });
  }

  serviceChange = (val) => {
    if (!val[0]) {
      delete this.state.filterObj.Services;
      delete this.state.filterObj.ProductGroups;
    }
    this.setState({
      filterObj: {
        ...this.state.filterObj,
        Services: val.toString()
      }
    });
  }

  statusChange = (val) => {
    if (val == 'all') {
      delete this.state.filterObj.Status;
      return;
    }
    this.setState({
      filterObj: {
        ...this.state.filterObj,
        Status: val
      }
    });
  }

  handleDateChange = (val = []) => {
    if (!val[0] || !val[1]) {
      delete this.state.filterObj.BeginTime;
      delete this.state.filterObj.EndTime;
      delete this.state.filterObj._beginTime;
      delete this.state.filterObj._endTime;
      this.setState({
        pickerValue: val,
      });
      return;
    }
    this.setState({
      pickerValue: val,
      filterObj: {
        ...this.state.filterObj,
        BeginTime: val[0],
        EndTime: val[1],
        _beginTime: val[0].unix(),
        _endTime: val[1].unix()
      }
    });
  }

  handleMonthChange = (val = []) => {
    if (val.length === 0) {
      delete this.state.filterObj.BeginTime;
      delete this.state.filterObj.EndTime;
      delete this.state.filterObj._beginTime;
      delete this.state.filterObj._endTime;
      this.setState({
        pickerValue: val,
      });
      return;
    }
    const filterObj = { ...this.state.filterObj };
    if (val[0]) {
      filterObj.BeginTime = val[0].startOf('month');
      filterObj._beginTime = val[0].startOf('month').unix();
    }
    if (val[1]) {
      filterObj.EndTime = val[1].endOf('month');
      filterObj._endTime = val[1].endOf('month').unix();
    }
    this.setState({
      pickerValue: val,
      filterObj
    });
  }

  search = (params, payType) => {
    let time = {};
    if (params.BeginTime) {
      time.BeginTime = params.BeginTime.startOf('day').toISOString();
    }
    if (params.EndTime) {
      time.EndTime = params.EndTime.endOf('day').toISOString();
    }
    if (params.Services) {
      params.ProductGroups = params.Services;
    }
    delete params.Services;

    const Customer = {};
    if (this.state.Customer) {
      Customer.Customer = this.state.Customer;
    }
    const IgnoreZero = {};
    if (this.state.billIgnoreZero) {
      IgnoreZero.IgnoreZero = true;
    }
    if (payType == 'post') {
      this.props.getPosts({
        ...params,
        ...time,
        ServiceTree: this.state.ServiceTree.ServiceTree,
        PayType: payType,
        ...Customer,
        ...IgnoreZero
      });
    } else {
      this.props.getPres({
        ...params,
        ...time,
        PayType: payType,
        ...Customer
      });
    }
  }

  payTypeChange = (e) => {
    this.setState({
      PayType: e.target.value,
    });
    this.payType = e.target.value;
    this.search(this.state.filterObj, this.payType);
  }

  addSelectTags = () => {
    if (this.state.selectTags.length === 5) {
      message.warn('最多添加5条标签搜索条件！');
      return;
    }
    this.setState(({ selectTags }) => {
      return {
        selectTags: selectTags.concat([{
          key: undefined,
          value: 'all',
        }])
      };
    });
  }

  deleteSelectTags = (idx) => {
    const { selectTags } = this.state;
    selectTags.splice(idx, 1);
    this.setState({
      selectTags
    });
    this.refresh(selectTags);
  }


  refresh = (nextSelectTags) => {
    const filterObj = Object.keys(this.state.filterObj).reduce((obj, key) => {
      if (!/Tags/.test(key)) {
        obj[key] = this.state.filterObj[key];
      }
      return obj;
    }, {});
    const params = nextSelectTags.reduce((obj, tag) => {
      const key = `Tags[${tag.key}]`;
      if (tag.key) {
        obj[key] = tag.value === '' ? 'all' : tag.value;
      }
      return obj;
    }, filterObj);
    this.setState({
      filterObj
    });
    this.search(params, this.payType);
  }

  onTagValueChange = (value, idx) => {
    const { selectTags } = this.state;
    const nextSelectTags = Array.from(selectTags);
    nextSelectTags[idx] = {
      ...selectTags[idx],
      value
    };
    this.setState({
      selectTags: nextSelectTags
    });
    this.refresh(nextSelectTags);
  }
  ref = null
  setRef = ref => {
    this.ref = ref;
  }

  getAccountIds = async QueryName => {
    if (!QueryName) {
      return {};
    }
    const AccountIds = [];
    const data = await Apis.QueryAccountV2({
      QueryName,
      Limit: 999
    });
    data.List.forEach(user => {
      AccountIds.push(user.Id);
    });
    return {
      AccountIds: AccountIds + ''
    };
  }

  accountChange = (e) => {
    const name = e.target.value;
    this.setState({
      filterObj: {
        ...this.state.filterObj,
        name
      }
    }, async () => {
      if (!name) {
        delete this.state.filterObj.AccountIds;
        return;
      }
      const params = await this.getAccountIds(name);
      this.setState({
        filterObj: {
          ...this.state.filterObj,
          ...params
        }
      });
    });
  }

  setSmData = async (parent, smData) => {
    let temp = [...smData];
    const res = await smApis.smIdChildrenTreeView({ id: parent.path, max_level: 1 });
    if (res.data) {
      parent.children = res.data;
      const smData = formatSm(parent);
      addSmData(temp, smData);
    }
    return temp;
  }

  render() {
    return (
      <div className="content-box" ref={this.setRef} >
        <div className={style.row}>
          <div className={style.group}>
            <span className="common-box">
              产品名称:
            </span>
            <Select getPopupContainer={() => this.ref} mode="multiple" defaultValue={this.props.productId ? this.props.productId : undefined} style={{ width: '200px', marginBottom: '10px' }} onChange={this.serviceChange} className="common-box">
              {
                this.props.services.map((key) => {
                  return (
                    <OptGroup label={expenseConfig.Service[key]} key={key}>
                      {Object.keys(expenseConfig.ProductGroup).map((groupId) => {
                        if (expenseConfig.ServiceOfProductGroup[groupId] === key) {
                          return (
                            <Option key={groupId} value={groupId}>{expenseConfig.ProductGroup[groupId]}</Option>
                          );
                        } else {
                          return '';
                        }
                      })}
                    </OptGroup>
                  );
                })
              }
            </Select>
          </div>
          {this.props.isBill && this.state.smData && this.state.smData[0] && this.state.smData[0].value && <div className={style.group}>
            <span className="common-box">服务树:</span>
            <TreeSelect
              getPopupContainer={() => this.ref}
              loadData={treeNode => {
                return new Promise(async resolve => {
                  if (treeNode.props.children && treeNode.props.children.length != 0) {
                    resolve();
                    return;
                  }
                  let parent = [...treeNode.props];
                  parent.name = treeNode.props.title;
                  parent.path = treeNode.props.value;
                  const smData = await this.setSmData(parent, this.state.smData);
                  this.setState({
                    smData
                  });
                  resolve();
                });
              }}
              treeDefaultExpandedKeys={[this.state.smData[0].key]}
              value={this.state.ServiceTree.ServiceTree}
              style={{ width: 200, margin: '0 0 0 5px' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={this.state.smData}
              onChange={data => {
                let ServiceTree = {};
                if (data) {
                  ServiceTree = {
                    ServiceTree: data
                  };
                }
                this.setState({
                  ServiceTree
                });
              }}
            />
            &nbsp;&nbsp;&nbsp;
            <Tooltip getPopupContainer={() => this.ref} placement="topLeft" title='该信息用于对账单的{customer}字段进行模糊检索，如：输入lf，则查询时返回{customer}字段包括“lf”字符的账单' arrowPointAtCenter>
              <Input
                placeholder="请输入{customer}字段的检索信息"
                style={{ width: '250px' }}
                value={this.state.Customer}
                onChange={e => {
                  this.setState({
                    Customer: e.target.value
                  });
                }}/>
            </Tooltip>
          </div>}

          {(() => {
            if (this.state.PayType == 'post' || this.props.showPayType) {
              return (
                <div className={style.group}>
                  <span className="common-box">支付状态:</span>
                  <Select getPopupContainer={() => this.ref} defaultValue={this.props.payStatus ? this.props.payStatus : 'all'} style={{ width: 100 }} onChange={this.statusChange} className="common-box">
                    <Option value="all">全部</Option>
                    {
                      Object.keys(this.props.status).map((key) => {
                        return (
                          <Option key={key} value={key}>{this.props.status[key]}</Option>
                        );
                      })
                    }
                  </Select>
                </div>
              );
            }
          })()}

          <div className={style.group}>
            <RangePicker
              value={this.state.pickerValue}
              format={this.props.monthMode ? 'YYYY-MM' : 'YYYY-MM-DD'}
              mode={this.props.monthMode ? monthMode : defaultMode}
              className="common-box" style={{ width: 230 }}
              onChange={this.props.monthMode ? this.handleMonthChange : this.handleDateChange}
              onPanelChange={this.props.monthMode ? this.handleMonthChange : () => { }}
            />
          </div>
          <div className={style.group}>
            <span className="common-box">用户名:</span>
            <Input
              value={this.state.filterObj.name}
              className="common-box"
              placeholder="请输入用户名搜索"
              onChange={this.accountChange}
              style={{ width: 140 }}
            />
          </div>
          <Button type="primary" className="common-box" onClick={this.search.bind(this, this.state.filterObj, this.payType)}>查询</Button>

          <Button type="primary" onClick={this.props.showModal}>导出</Button>
        </div>
        <div className={style.row}>
          <Radio.Group defaultValue={this.props.payType ? this.props.payType : 'post'} buttonStyle="solid" className="common-box" onChange={this.payTypeChange}>
            <Radio.Button value="post">后付费</Radio.Button>
            <Radio.Button value="pre">预付费</Radio.Button>
          </Radio.Group>
          {(() => {
            if (this.state.PayType == 'pre' && this.props.showHideTip) {
              return (
                <Checkbox style={{ margin: '6px 0 0 15px' }} onChange={this.props.hideZeroOrder}>隐藏0元订单</Checkbox>
              );
            } else if (this.props.showHideTipBill) {
              return <Checkbox style={{ margin: '6px 0 0 15px' }} checked={this.state.billIgnoreZero} onChange={e => {
                this.setState({
                  billIgnoreZero: e.target.checked
                });
              }}>隐藏0元账单</Checkbox>;
            }
          })()}
        </div>
      </div>
    );
  }
}

export default Filter;