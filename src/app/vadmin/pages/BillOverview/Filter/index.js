import React, { Component } from 'react';
import { DatePicker ,Button , message, TreeSelect, Input, Tooltip, Radio } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import smApis from '../../../../../server/api/public/serviceMeta';

const { RangePicker } = DatePicker;
const  RadioGroup  = Radio.Group;
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
function addSmData(temp, smData) {
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

class Filter extends Component {
  static defaultProps = {
    services: {},
    status: {},
    hideZeroOrder: ()=>{},
    search: ()=>{},
    showHideTip: false,
    isBill: false,
  }
  static propTypes = {
    services: PropTypes.object,
    isBill: PropTypes.bool
  }

  constructor(props) {
    super(props);
    const pickerValue = [
      moment().subtract(6, 'months'),
      moment()
    ];
    this.state = {
      filterObj: {
        BeginTime: pickerValue[0],
        EndTime: pickerValue[1]
      },
      modalVisible: false,
      pickerValue,
      tagValues: [],
      selectTags: [],
      smId: 0,
      smData: [],
      ServiceTree: {},
      newSelectTag: null,
      initialRange: 6
    };
  }

  componentDidMount = async () => {
    let smId = 0;
    let smData = [];
    let ServiceTree = {};
    try {
      const res = await smApis.smIdChildrenTreeView({ id: smId, max_level: 1  });
      let parent = res.data[0];
      parent.path = 'all';
      parent.name = '全部';
      parent.children = res.data.splice(1);
      smData = [formatSm(parent)];
      ServiceTree.ServiceTree = smData[0].value;
    } catch (e) {
      console.log(e);
    }
    this.setState({
      smId,
      smData,
      ServiceTree
    }, this.search);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.product !== nextProps.product){
      this.search();
    }
  }

  serviceChange = (val) => {
    const filterObj = { ...this.state.filterObj };
    if (val == 'all') {
      delete filterObj.Services;
      this.setState({
        filterObj
      }, this.search);
      return;
    }
    this.setState({
      filterObj: {
        ...filterObj,
        Services: val
      }
    }, this.search);
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

  handleMonthChange = (val = [], data, callback = () => {}) => {
    if (val.length === 0) {
      delete this.state.filterObj.BeginTime;
      delete this.state.filterObj.EndTime;
      this.setState({
        pickerValue: val,
      }, callback);
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
    }, callback);
  }

  accountChange = (e) => {
    if (!e.target.value) {
      delete this.state.filterObj.AccountIds;
      return;
    }
    this.setState({
      filterObj: {
        ...this.state.filterObj,
        AccountIds: e.target.valude
      }
    });
  }

  onPressSearch =()=>{
    this.search();
  }

  search = (params = this.state.filterObj) => {
    let time = {};
    if (params.BeginTime) {
      time.BeginTime = params.BeginTime.startOf('month').toISOString();
    }
    if (params.EndTime) {
      time.EndTime = params.EndTime.endOf('month').toISOString();
    }
    let Customer = {};
    if (this.state.Customer) {
      Customer.Customer = this.state.Customer;
    }
    this.props.search({
      ...this.state.ServiceTree,
      ...params,
      ...time,
      ...Customer,
    });
  }

  addNewSelectTag = () => {
    if (this.state.selectTags.length === 5) {
      message.warn('最多添加5条标签搜索条件！');
      return;
    }
    this.setState({
      newSelectTag: {
        id: +new Date(),
        key: undefined,
        value: 'all',
      }
    });
  }

  addSelectTags = () => {
    const selectTags = [...this.state.selectTags, this.state.newSelectTag];
    this.setState({
      selectTags,
      newSelectTag: null
    });
    this.refresh(selectTags);
  }

  deleteSelectTags = (id) => {
    let { selectTags } = this.state;
    selectTags = selectTags.filter(tag => tag.id !== id);
    this.setState({
      selectTags
    });
    this.refresh(selectTags);
  }

  deleteSelectTag = () => {
    this.setState({
      newSelectTag: null
    });
  }

  refresh = (nextSelectTags) => {
    const filterObj = Object.keys(this.state.filterObjx).reduce((obj, key) => {
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
    this.search(params);
  }

  onTagKeyChange = (value) => {
    const { tagMap } = this.props;
    let { newSelectTag } = this.state;
    if (!tagMap[value] || tagMap[value].length === 0) {
      this.props.actions.updateTagMap(value);
    }
    if (!newSelectTag) newSelectTag = {};
    newSelectTag = {
      ...newSelectTag,
      key: value,
      value: 'all'
    };
    this.setState({
      newSelectTag
    });
  }

  onTagValueChange = (value) => {
    let { newSelectTag } = this.state;
    newSelectTag = {
      ...newSelectTag,
      value
    };
    this.setState({
      newSelectTag,
    });
  }

  changeMonth = (count = 6) => {
    this.handleMonthChange([
      moment().subtract(count, 'months'),
      moment()
    ], {}, this.search);
  }
  
  changeRange = (e) => {
    let count = e.target.value;
    this.setState({
      initialRange: count
    })
    this.handleMonthChange([
      moment().subtract(count, 'months'),
      moment()
    ], {}, this.search)
  }

  ref = null

  setRef = ref => {
    this.ref = ref;
  }

  render() {
    return (
      <div ref={this.setRef} style={{ position: 'relative' }}>
        <h3>历史数据</h3><br />
        {this.state.smData && this.state.smData[0] && this.state.smData[0].value ? <span>
          <span style={{
            margin: '0 10px 0 14px'
          }}>服务树:</span>
          <TreeSelect
            key={this.props.product}
            getPopupContainer={() => this.ref}
            loadData={treeNode => {
              return new Promise(async resolve => {
                if (treeNode.props.children && treeNode.props.children.length != 0) {
                  resolve();
                  return;
                }
                let temp = temp = [...this.state.smData];
                let parent = [...treeNode.props];
                parent.name = treeNode.props.title;
                parent.path = treeNode.props.value;
                const res = await smApis.smIdChildrenTreeView({ id: treeNode.props.value, max_level: 1 });
                if (res.data) {
                  parent.children = res.data;
                  const smData = formatSm(parent);
                  addSmData(temp, smData);
                }
                this.setState({
                  smData: temp
                });
                resolve();
              });
            }}
            treeDefaultExpandedKeys={[this.state.smData[0].key]}
            value={this.state.ServiceTree.ServiceTree}
            style={{ width: 200, margin: '0 15px 0 5px' }}
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
        </span> : ''}
        <br />
        <span className="common-box">
            消费日期:
        </span>
        <RangePicker
          allowClear={false}
          value={this.state.pickerValue}
          format={this.props.monthMode ? 'YYYY-MM' : 'YYYY-MM-DD'}
          mode={this.props.monthMode ? monthMode : defaultMode}
          className="common-box" style={{ width: 230 }}
          onChange={this.props.monthMode ? this.handleMonthChange : this.handleDateChange}
          onPanelChange={this.props.monthMode ? this.handleMonthChange : () => {}}
        />
        <Button  type="primary" className="common-box" onClick={this.onPressSearch}>查询</Button>
        {/* <a className="common-box" style={{ marginTop: '10px' }} onClick={() => this.changeMonth(6)}>最近6个月</a>
        <a className="common-box" style={{ marginTop: '10px' }} onClick={() => this.changeMonth(12)}>最近12个月</a> */}
        <RadioGroup name="selectRange" className="common-box" style={{ marginTop: '10px' }} onChange={this.changeRange} value={this.state.initialRange}>
          <Radio value={6}>最近6个月</Radio>
          <Radio value={12}>最近12个月</Radio>
        </RadioGroup>
      </div>
    );
  }
}

export default Filter;