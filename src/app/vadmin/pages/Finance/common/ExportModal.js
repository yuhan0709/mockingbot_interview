import React, { Component } from 'react';
import { Select, DatePicker , Modal ,Alert, Form, Radio } from 'antd';
import { withRouter } from 'react-router';
const Option = Select.Option;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@withRouter
class ExportModal extends Component {
  static defaultProps = {
    title: '导出账单',
    tips: '导出格式为CSV，可以用Excel浏览',
    okText: '导出',
    statusForPost: {},
    statusForPre: {},
    handleOk: () => { console.log('ok'); }
  }
  Status = this.props.statusForPost;
  handleOk = () => {

    let obj = this.props.form.getFieldsValue();
    obj.Services = this.props.match.params.serviceName;
    if (obj.Status == 'all') { delete obj.Status; }
    if (obj.time) {
      if (obj.time[0]) obj.BeginTime = obj.time[0].startOf('day').toISOString();
      if (obj.time[1]) obj.EndTime = obj.time[1].endOf('day').toISOString();
    }
    this.props.handleOk(obj);
  }
  payTypeChange = (e) => {
    console.log('type:', e);
    if (e.target.value == 'post') {
      this.Status = this.props.statusForPost;
    } else {
      this.Status = this.props.statusForPre;
    }
    this.props.form.setFieldsValue({
      Status: 'all'
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const Status = this.Status;

    return (
      <div>
        <Modal
          title={this.props.title}
          visible={this.props.visible}
          okText={this.props.okText}
          onOk={this.handleOk}
          onCancel={this.props.handleCancel}
        >
          <Alert message={this.props.tips} type="info" showIcon className="common-box"/>
          <br /><br />
          <Form>
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
