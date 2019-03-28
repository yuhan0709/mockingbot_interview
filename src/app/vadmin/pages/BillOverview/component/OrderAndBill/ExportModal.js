import React, { Component } from 'react';
import { connect } from 'react-redux';
import { defaultMergeProps } from 'react-redux/lib/connect/mergeProps';
import { Select, DatePicker , Modal ,Alert, Form, Radio, message } from 'antd';
import style from './Filter/style.less';
import { bindActionCreators } from 'redux';
import tagActions from '../../redux/actions/tag';

const Option = Select.Option;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@connect((state) => ({
  tagKeys: state.Tag.keys || [],
  tagMap: state.Tag.tagMap || {},
  projectConfig: state.Config.projectConfig
}), dispatch => ({
  actions: bindActionCreators(tagActions, dispatch)
}),
defaultMergeProps, {
  pure: false,
})
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
  }
  Status = this.props.statusForPost
  handleOk = () => {
    let obj = this.props.form.getFieldsValue();
    if (obj.Services == 'all') { delete obj.Services; }
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
  render() {
    const { getFieldDecorator } = this.props.form;
    const expenseConfig = this.props.projectConfig.expenseConfig;
    const Service = expenseConfig.Service;
    const Status = this.Status;
    const { tagMap, tagKeys } = this.props;
    return (
      <div>
        <Modal
          title={this.props.title}
          width={600}
          visible={this.props.visible}
          okText={this.props.okText}
          onOk={this.handleOk}
          onCancel={this.props.handleCancel}
        >
          <Alert style={{ marginLeft: '70px' }} message={this.props.tips} type="info" showIcon className="common-box"/>
          <Form>
            <FormItem
              {...formItemLayout}
              label="产品名称"
            >
              {getFieldDecorator('Services',{
                initialValue: 'all'
              })(
                <Select style={{ width: 120 }}>
                  <Option value="all">全部</Option>
                  {
                    Object.keys(Service).map((key) => {
                      return (
                        <Option key={key} value={key}>{Service[key]}</Option>
                      );
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="付款类型"
            >
              {getFieldDecorator('PayType',{
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
              {getFieldDecorator('Status',{
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
              label="标签搜索"
            >
              {this.state.selectTags.map((tag, idx) =>
                <div key={Math.random() * 10000} className={style.tag}>
                  <Select
                    style={{ width: 150 }}
                    value={tag.key}
                    onChange={value => this.onTagKeyChange(value, idx)}
                    className={style.select}
                    showSearch
                    optionFilterProp="children"
                    placeholder = '请选择标签键'
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    {tagKeys.map(key => {
                      return <Option key={key} value={key}>{key}</Option>;
                    })}
                  </Select>&nbsp;&nbsp;&nbsp;
                  <Select
                    style={{ width: 150 }}
                    value={tag.value === 'all' ? undefined : tag.value}
                    onChange={value => this.onTagValueChange(value, idx)}
                    className={style.select}
                    showSearch
                    optionFilterProp="children"
                    placeholder = '请选择标签值'
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    {(tagMap[tag.key] || []).map(v => {
                      return <Option key={v.TagId} value={v.TagValue}>{v.TagValue || '空'}</Option>;
                    })}
                  </Select>&nbsp;&nbsp;&nbsp;
                  {idx !== 0 && <a style={{ marginRight: '10px' }} onClick={() => this.deleteSelectTags(idx)}>删除</a>}
                  {(this.state.selectTags.length - 1) === idx ? <a onClick={this.addSelectTags}>添加</a> : null}
                </div>
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
