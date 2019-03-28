import React, { Component } from 'react';
import { Modal, Input, Form, Select, Button, message } from 'antd';
import Apis from '../../util/request';
import style from './index.less';
import AddTag from './addTag';

const FormItem = Form.Item;
const Option = Select.Option;
let counter = 0;

class EditModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      confirmLoading: false,
      tags: [],
      addTags: [],
      Insider: false,
      ServiceTreeNodeId: ''
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      const tags = [];
      let Insider = false, ServiceTreeNodeId = '';
      nextProps.target.Tags && nextProps.target.Tags.forEach(tag => {
        if (tag.TagKey === 'Insider') {
          Insider = true;
        } else if (tag.TagKey === 'ServiceTreeNodeId') {
          ServiceTreeNodeId = tag.TagValue;
        } else {
          tags.push(tag);
        }
      });
      this.setState({
        value: '',
        tags,
        addTags: [],
        Insider,
        ServiceTreeNodeId
      }, () => {
        this.props.form.resetFields();
      });
    }
  }

  confirm = () => {
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        if (values.email) {
          await Apis.UpdateEmailV2({ AccountId: this.props.target.Id, Email: values.email });
        }
        let addTags = [];
        let delTags = [];
        let tags = [];
        this.props.target.Tags && this.props.target.Tags.forEach(tag => {
          if (
            tag.TagKey !== 'ServiceTreeNodeId' &&
            tag.TagKey !== 'Insider'
          ) {
            tags.push(tag);
          }
        });
        this.state.tags.map(ntag => {
          let index = tags.findIndex(tag => tag.TagKey + '' === ntag.TagKey + '' && tag.TagValue + '' === ntag.TagValue + '');
          if (index === -1) {
            addTags.push(ntag);
          } else {
            tags.splice(index, 1);
          }
        });
        delTags = [...tags];
        if (this.state.Insider) {
          if (values.Insider === '0') {
            delTags.push({
              TagKey: 'Insider',
              TagValue: '1'
            });
          }
        } else {
          if (values.Insider === '1') {
            addTags.push({
              TagKey: 'Insider',
              TagValue: '1'
            });
          }
        }
        if (addTags.length > 0 || delTags.length > 0) {
          await Apis.UpdateTagsV2({
            addTags,
            delTags,
            AccountId: this.props.target.Id,
          });
        }
        this.props.hideModal();
        this.props.refresh();
      }
    });
  }

  addTag = kv => {
    if (
      kv.TagKey === 'ServiceTreeNodeId' ||
      kv.TagKey === 'Insider') {
      message.warning(kv.TagKey + '为预置标签');
      return false;
    }
    if (this.state.tags.findIndex(tag => tag.TagKey + '' === kv.TagKey + '' && tag.TagValue + '' === kv.TagValue + '') === -1) {
      this.setState({
        tags: [...this.state.tags, kv]
      });
      return true;
    }
    message.warning('标签已存在');
    return false;
  }

  delTag = tag => {
    let tags = [...this.state.tags];
    tags.splice(tags.findIndex(ele => ele === tag), 1);
    this.setState({
      tags
    });
  }

  AddTagOnCancel = key => {
    let addTags = [...this.state.addTags];
    addTags.splice(addTags.findIndex(tag => tag === key), 1);
    this.setState({
      addTags
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        width={700}
        title="编辑"
        visible={this.props.visible}
        onOk={this.confirm}
        onCancel={this.props.hideModal}
        confirmLoading={this.state.confirmLoading}
      >
        <Form className={style.antFormItem}>
          <table>
            <tbody>
              <tr>
                <td style={{ textAlign: 'right', width: 150 }}>用户ID：</td>
                <td style={{ height: 34 }}>
                  {this.props.target.Id}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'right' }}>用户名：</td>
                <td style={{ height: 34 }}>
                  {this.props.target.Identity}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'right' }}>邮箱：</td>
                <td>
                  <FormItem>
                    {getFieldDecorator('email', {
                      rules: [{
                        pattern: /^[a-z.A-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                        message: '邮箱格式错误'
                      }],
                    })(
                      <Input
                        placeholder="请输入邮箱"
                        style={{ width: 300 }}
                      />
                    )}
                  </FormItem>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'right' }}>服务树ID：</td>
                <td>
                  <Input value={this.state.ServiceTreeNodeId} disabled={true} style={{ width: 120 }} />
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'right' }}>是否为公司内部人员：</td>
                <td>
                  <FormItem>
                    {getFieldDecorator('Insider', {
                      initialValue: this.state.Insider ? '1' : '0',
                    })(
                      <Select style={{ width: 120 }}>
                        <Option value="0">否</Option>
                        <Option value="1">是</Option>
                      </Select>
                    )}
                  </FormItem>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'right' }}>自定义标签：</td>
                <td>
                  标签由区分大小写的键值对组成。例如，您可以添加一个键为“group”且值为“vod”的标签。
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  {this.state.tags.map(tag => (
                    <div className={style.tag} key={tag.TagKey + tag.TagValue}>
                      <span>{tag.TagKey}：{tag.TagValue}</span>
                      <a onClick={() => {
                        this.delTag(tag);
                      }}>删除</a>
                    </div>
                  ))}
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <Button type="primary" icon="plus" size="small" onClick={() => {
                    this.setState({
                      addTags: [...this.state.addTags, counter++]
                    });
                  }}>添加自定义标签</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </Form>
        <br />
        {this.state.addTags.map(key => (
          <AddTag
            key={key}
            onOk={kv => {
              if (this.addTag(kv)) {
                this.AddTagOnCancel(key);
              }
            }}
            onCancel={() => {
              this.AddTagOnCancel(key);
            }}
          />
        ))}
      </Modal>
    );
  }
}

const fcEditModal = Form.create()(EditModal);

export default fcEditModal;