import React, { Component } from 'react';
import { Select, DatePicker, Modal, Alert, Form, Radio, message, TreeSelect } from 'antd';
import smApis from '../../../../../../../../server/api/public/serviceMeta';
import { formatSm, addSmData } from './Filter';
import { gerService } from '../../../../../../util';

const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};


const expenseConfig = window.INIT_CONFIG.expenseConfig;
class ExportModal extends Component {
  static defaultProps = {
    title: '导出账单',
    tips: '导出格式为CSV，可以用Excel浏览',
    okText: '导出',
    statusForPost: {},
    statusForPre: {},
    handleOk: () => { console.log('ok'); }
  }
  state = {
    selectTags: [{
      key: undefined,
      value: 'all',
    }],
    filterObj: {
      PayType: 'post'
    },
    smId: 0,
    smData: [],
    ServiceTree: {}
  }
  Status = this.props.statusForPost
  services = (gerService('bill') || []).map(ele => {
    return ele.Name;
  });

  componentDidMount() {
    this.initServiceTree();
  }
  initServiceTree = async () => {
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
    this.setState({
      smId,
      smData,
      ServiceTree,
    });
  }
  handleOk = () => {
    let obj = this.props.form.getFieldsValue();
    if (obj.ProductGroups == 'all') {
      delete obj.ProductGroups;
      obj.Service = this.services + '';
    }
    if (obj.Status == 'all') { delete obj.Status; }
    if (obj.time) {
      if (obj.time[0]) obj.BeginTime = obj.time[0].startOf('day').toISOString();
      if (obj.time[1]) obj.EndTime = obj.time[1].endOf('day').toISOString();
      delete obj.time;
    }

    this.state.selectTags.forEach(tag => {
      if (!tag.key) {
        return;
      }
      obj[`Tags[${tag.key}]`] = tag.value;
    });
    obj.ServiceTree = this.state.ServiceTree.ServiceTree;
    this.props.handleOk(obj);
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
  payTypeChange = (e) => {
    if (e.target.value == 'post') {
      this.Status = this.props.statusForPost;
    } else {
      this.Status = this.props.statusForPre;
    }
    this.props.form.setFieldsValue({
      Status: 'all'
    });
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
  }
  ref = null
  setRef = ref => {
    this.ref = ref;
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const Status = this.Status;
    return (
      <div ref={this.setRef}>
        <Modal
          title={this.props.title}
          width={600}
          visible={this.props.visible}
          okText={this.props.okText}
          onOk={this.handleOk}
          onCancel={this.props.handleCancel}
        >
          <Alert style={{ marginLeft: '70px' }} message={this.props.tips} type="info" showIcon className="common-box" />
          <Form>
            <FormItem
              {...formItemLayout}
              label="产品名称"
            >
              {getFieldDecorator('ProductGroups', {
                initialValue: 'all'
              })(
                <Select style={{ width: 120 }}>
                  <Option value="all">全部</Option>
                  {
                    this.services.map((key) => {
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
              )}
            </FormItem>
            {
              this.state.smData && this.state.smData[0] && this.state.smData[0].value &&
              <FormItem
                {...formItemLayout}
                label="服务树"
              >
                <TreeSelect
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
              </FormItem>
            }
            <FormItem
              {...formItemLayout}
              label="付款类型"
            >
              {getFieldDecorator('PayType', {
                initialValue: 'post'
              })(
                <Radio.Group onChange={this.payTypeChange}>
                  <Radio value="post">后付费</Radio>
                  <Radio value="pre">预付费</Radio>
                </Radio.Group>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="支付状态"
            >
              {getFieldDecorator('Status', {
                initialValue: 'all'
              })(
                <Select style={{ width: 120 }}>
                  <Option value="all">全部</Option>
                  {
                    Object.keys(Status).map((key) => {
                      return (
                        <Option key={key} value={key}>{Status[key]}</Option>
                      );
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="导出时间维度"
            >
              {getFieldDecorator('time')(
                <RangePicker className="common-box" />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
const WrappedExportModal = Form.create()(ExportModal);

export default WrappedExportModal;
