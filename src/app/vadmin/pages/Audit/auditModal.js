import React, { Component } from 'react';
import { Form, Modal, Select, Radio, Input } from 'antd';
import Apis from '../../util/request';
import style from './style.less';
import moment from 'moment';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

const refuse_reason = [
  '暂不符合开通要求',
  '自定义'
];
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      status: '2',
      refuse_reason: 0,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible){
      this.props.form.resetFields();
      this.setState({
        visible: true,
        status: nextProps.data.status,
      });
    }
  }

  handleCancel = () => {
    this.setState({
      visible: false
    });
  }

  handleOk = () => {
    this.props.form.validateFields( async (err, values) => {
      if (!err) {
        const params = {
          ...values,
          create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
          idx_audit_id: this.props.data.id,
          details: JSON.stringify(this.props.data.details),
          user_id: this.props.data.idx_user_id,
          service: this.props.data.service,
        };
        params.refuse_reason = refuse_reason[params.refuse_reason] === '自定义'
          ? params.user_defined
          : refuse_reason[params.refuse_reason];
        await Apis.InsertAuditDetail(params);
        this.props.refresh();
        this.handleCancel();
      }
    });

  }

  render() {
    const { details = {} } = this.props.data;
    const status = this.state.status;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 5 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 19 },
        sm: { span: 19 },
      },
    };
    return (
      <Modal
        title="审核"
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form className={style.form}>
          <FormItem>
            <h3>详情</h3>
          </FormItem>
          {
            details && Object.keys(details).map(key => (<FormItem
              key={key}
              {...formItemLayout}
              label={key}
            >
              <span>{details[key]}</span>
            </FormItem>))
          }
          <FormItem>
            <h3>审核处理</h3>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="状态"
          >
            {getFieldDecorator('status',{
              initialValue: status + '',
              getValueFromEvent: event => {
                this.setState({
                  status: event.target.value
                });
                return event.target.value;
              }
            })(
              <Radio.Group buttonStyle="solid">
                <Radio.Button value="0">通过</Radio.Button>
                <Radio.Button value="1">未通过</Radio.Button>
                <Radio.Button value="2">待审核</Radio.Button>
              </Radio.Group>
            )}
          </FormItem>
          {
            status == '1' && <FormItem
              {...formItemLayout}
              label="未通过理由"
            >
              {getFieldDecorator('refuse_reason',{
                initialValue: this.state.refuse_reason,
                getValueFromEvent: value => {
                  this.setState({
                    refuse_reason: value
                  });
                  return value;
                }
              })(
                <Select style={{ width: '100%' }}>
                  {refuse_reason.map((reason, index) => (
                    <Option key={index} value={index}>{reason}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          }
          {
            status == '1'
                    && refuse_reason[this.state.refuse_reason] === '自定义'
                    && <FormItem
                      wrapperCol={{
                        xs: { span: 19, offset: 5 },
                        sm: { span: 19, offset: 5 },
                      }}
                    >
                      {getFieldDecorator('user_defined',{
                        getValueFromEvent: event => {
                          return event.target.value.slice(0,140);
                        }
                      })(
                        <TextArea placeholder="自定义未通过理由，140字以内" rows={4} />
                      )}
                    </FormItem>
          }
          <FormItem
            {...formItemLayout}
            label="备注"
          >
            {getFieldDecorator('description',{
              getValueFromEvent: event => {
                return event.target.value.slice(0,140);
              }
            })(
              <TextArea placeholder="140字以内" rows={4} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(Product);