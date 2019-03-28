import React, { Component } from 'react';
import { Select, DatePicker ,Button ,Input, Radio, Checkbox, TreeSelect, message } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import style from './style.less';
import tagActions from '../../../redux/actions/tag';
import { bindActionCreators } from 'redux';
import smApis from '../../../../../server/api/public/serviceMeta';
import moment from 'moment';

const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;
const defaultMode = ['date', 'date'];
const monthMode = ['month', 'month'];
function formatSm(data) {
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
@connect(state => ({
  ServiceOfProductGroup: state.Config.projectConfig.expenseConfig.ServiceOfProductGroup,
  ProductGroup: state.Config.projectConfig.expenseConfig.ProductGroup,
  Identity: state.User.Account.Identity,
  tagKeys: state.Tag.keys || [],
  tagMap: state.Tag.tagMap || {}
}), dispatch => ({
  actions: bindActionCreators(tagActions, dispatch)
}))
class Filter extends Component {
  static defaultProps = {
    services: {},
    status: {},
    hideZeroOrder: ()=>{},
    search: ()=>{},
    showAccountInput: true,
    showPayType: false,
    showHideTip: false,
    isBill: false
  }
  static propTypes = {
    services: PropTypes.object,
    isBill: PropTypes.bool
  }

  payType='post';

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
    if (this.props.tagKeys.length === 0) {
      this.props.actions.getTagKeyList();
    }
    let filterObj = {};
    if (this.props.productId) {
      filterObj.Services = this.props.productId;
    }
    if (this.props.payStatus) {
      filterObj.Status = this.props.payStatus;
    }
    if (this.props.beginTime || this.props.endTime) {
      const beginTime = this.props.beginTime ? moment.unix(this.props.beginTime) : '';
      const endTime = this.props.endTime ? moment.unix(this.props.endTime) : '';
      this.handleDateChange([beginTime,endTime]);
    }
    let smId = 0;
    let smData = [];
    let ServiceTree = {};
    try {
      let res = await smApis.smNodes({ name: this.props.Identity });
      smId = res.data.id;
      if (smId) {
        res = await smApis.smIdChildrenTreeView({ id: smId });
        smData = [formatSm(res.data)];
        ServiceTree.ServiceTree = this.props.serviceTree ? this.props.serviceTree : smData[0].value;
      }
    } catch (e) {
      console.log(e);
    }
    const PayType = {};
    if (this.props.payType) {
      PayType.PayType = this.props.payType;
      this.payType = this.props.payType;
    }
    this.setState({
      smId,
      smData,
      ServiceTree,
      ...PayType,
      filterObj: {
        ...this.state.filterObj,
        ...filterObj
      }
    },() => {
      if (this.props.filterSearch) {
        this.search(this.state.filterObj, this.payType);
      }
    });
  }
  UNSAFE_componentWillReceiveProps(nextprops) {
    if (this.props.tagKeys !== nextprops.tagKeys.length) {
      this.setState({
        tagKeys: nextprops.tagKeys
      });
    }
  }
  serviceChange = (val) => {
    if (!val[0]) {
      delete this.state.filterObj.Services;
      return;
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
        EndTime: val[1]
      }
    });
  }
  handleMonthChange = (val = []) => {
    if (val.length === 0) {
      delete this.state.filterObj.BeginTime;
      delete this.state.filterObj.EndTime;
      this.setState({
        pickerValue: val,
      });
      return;
    }
    const filterObj = { ...this.state.filterObj };
    if (val[0]) {
      filterObj.BeginTime = val[0].startOf('month');
    }
    if (val[1]) {
      filterObj.EndTime = val[1].endOf('month');
    }
    this.setState({
      pickerValue: val,
      filterObj
    });
  }

  accountChange = (e) => {
    if (!e.target.value) {
      delete this.state.filterObj.AccountIds;
      return;
    }
    this.setState({
      filterObj: {
        ...this.state.filterObj,
        AccountIds: e.target.value
      }
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
      delete params.Services;
    }
    if (payType == 'post') {
      this.props.getPosts({
        ...params,
        ...time,
        ServiceTree: this.state.ServiceTree.ServiceTree,
        PayType: payType
      });
    } else {
      this.props.getPres({
        ...params,
        ...time,
        PayType: payType
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

  onTagKeyChange = (value, idx) => {
    const { tagMap } = this.props;
    const { selectTags } = this.state;
    if (!tagMap[value] || tagMap[value].length === 0) {
      this.props.actions.updateTagMap(value);
    }

    const nextSelectTags = Array.from(selectTags);
    nextSelectTags[idx] = {
      ...selectTags[idx],
      key: value,
      value: 'all',
    };
    this.setState({
      selectTags: nextSelectTags
    });
    this.refresh(nextSelectTags);
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

  render() {
    return (
      <div className="content-box">
        <div className={style.row}>
          <div className={style.group}>
            <span className="common-box">
            产品名称:
            </span>
            <Select mode="multiple" defaultValue={this.props.productId ? this.props.productId : undefined} style={{ width: 200 }} onChange={this.serviceChange}  className="common-box">
              {
                Object.keys(this.props.services).map((key) => {
                  return (
                    <OptGroup label={this.props.services[key]} key={key}>
                      {Object.keys(this.props.ProductGroup).map((groupId) => {
                        if (this.props.ServiceOfProductGroup[groupId] === key) {
                          return (
                            <Option key={groupId} value={groupId}>{this.props.ProductGroup[groupId]}</Option>
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
          {this.props.isBill && this.state.smData && this.state.smData[0] && this.state.smData[0].value &&  <div className={style.group}>
            <span className="common-box">服务树:</span>
            <TreeSelect
              showSearch
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
          </div>}
          {(() => {
            if (this.state.PayType == 'post' || this.props.showPayType) {
              return (
                <div className={style.group}>
                  <span className="common-box">支付状态:</span>
                  <Select defaultValue={this.props.payStatus ? this.props.payStatus : 'all'} style={{ width: 100 }} onChange={this.statusChange}  className="common-box">
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
              onPanelChange={this.props.monthMode ? this.handleMonthChange : () => {}}
            />
          </div>
          {
            this.props.showAccountInput && (
              <div className={style.group}>
                <span className="common-box">用户名:</span>
                <Input
                  className="common-box"
                  placeholder="请输入用户名搜索"
                  onChange={this.accountChange}
                  style={{ width: 140 }}
                />
              </div>
            )
          }
          <Button  type="primary" className="common-box" onClick={this.search.bind(this, this.state.filterObj, this.payType)}>查询</Button>

          <Button  type="primary"  onClick={this.props.showModal}>导出</Button>
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
            }
          })()}
        </div>
      </div>
    );
  }
}

export default Filter;