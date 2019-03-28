import React, { Component } from 'react';
import EasyForm from '@component/EasyForm';
import { Form, Input, Radio, Modal, Upload, Button, Icon } from 'antd';
import PropTypes from 'prop-types';
import { addImage,testImage } from './util';

const RadioGroup = Radio.Group;
const EasyFormItem = EasyForm.Item;
// const Option = Select.Option;
const initialValueMap = {
  BusinessName: '',
  BusinessEnName: '',
  BusinessShortName: '',
  Status: 'offline',
  BusinessIcon: '',
  GroupId: '',
  Scope: 'private',
};
const itemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15, offset: 1 },
};

function UploadImg(uploadPoster,filePath){
  return <Upload accept="image/*" customRequest={uploadPoster} showUploadList={false}>
    {filePath && <p><img width={50} src={filePath} alt="封面"></img></p>}
    <Button>
      <Icon type="upload"/> 上传文件
    </Button>
  </Upload>;
}

@EasyForm.create()
class BusinessForm extends Component {
  static propTypes = {
    isEdit: PropTypes.bool,
    disabledOnline: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    visible: PropTypes.bool,
    business: PropTypes.object,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    initialValueMap: PropTypes.object,
  }
  static defaultProps = {
    isEdit: false,
    disabledOnline: true,
    visible: false,
    confirmLoading: false,
    initialValueMap,
    business: {},
    onOk: () => {
    },
    onCancel: () => {
    },
    appendInfo: [{},{}]
  }

  uploadPoster = (obj) => {
    addImage(obj.file, async (filePath) => {
      this.props.form.setFieldsValue({
        BusinessIcon: filePath
      });
      try {
        await testImage(filePath);
        this.formConfig.BusinessIcon.itemProps.childrenAfter = UploadImg(this.uploadPoster,filePath);
      } catch (e) {
        this.formConfig.BusinessIcon.itemProps.childrenAfter = UploadImg(this.uploadPoster,'');
      }
    });
  }

  // UNSAFE_componentWillReceiveProps({ appendInfo,isEdit }) {
  //   if (this.props.appendInfo !== appendInfo) {
  //     console.log('appendInfo', appendInfo);
  //     this.formConfig.GroupId.children = <Select disabled={isEdit}>
  //       {appendInfo.map(group => {
  //         return <Option key={group.Id} value={group.Id}>{group.GroupName}</Option>;
  //       })}
  //     </Select>;
  //   }
  // }
  formConfig = {
    BusinessName: {
      itemProps: {
        ...itemLayout,
        label: '文档库名称',
        getFieldFParam: {
          name: 'BusinessName',
          config: {
            rules: [{
              required: true,
              message: '文档库名称必填',
            }],
            initialValue: this.props.initialValueMap.BusinessName
          }
        }
      },
      children: (<Input maxLength={20} placeholder="请输入文档库名称"/>)
    },
    BusinessEnName: {
      itemProps: {
        ...itemLayout,
        label: '英文全称',
        getFieldFParam: {
          name: 'BusinessEnName',
          config: {
            rules: [{
              required: true,
              message: '英文全称必填',
            }, {
              pattern: /^(\w|\s)+$/g,
              message: '只允许使用英文、数字、下划线、空格'
            }],
            initialValue: this.props.initialValueMap.BusinessEnName
          }
        }
      },
      children: (<Input maxLength={50} placeholder="请输入英文全称"/>)
    },
    BusinessShortName: {
      itemProps: {
        ...itemLayout,
        label: '英文简称',
        getFieldFParam: {
          name: 'BusinessShortName',
          config: {
            rules: [{
              required: true,
              message: '英文简称必填',
            }, {
              pattern: /^\w+$/g,
              message: '只允许使用英文、数字、下划线'
            }],
            initialValue: this.props.initialValueMap.BusinessShortName
          }
        }
      },
      children: (<Input maxLength={10} placeholder="英文简称" disabled={this.props.isEdit}/>)
    },
    BusinessDescription: {
      itemProps: {
        ...itemLayout,
        label: '描述',
        getFieldFParam: {
          name: 'BusinessDescription',
          config: {
            initialValue: this.props.initialValueMap.BusinessDescription
          }
        }
      },
      children: (<Input.TextArea maxLength={140} autosize={{ minRows: 2, maxRows: 6 }} placeholder="文档库描述"/>)
    },
    // 文档封面
    BusinessIcon: {
      itemProps: {
        ...itemLayout,
        label: '文档库封面',
        getFieldFParam: {
          name: 'BusinessIcon',
          config: {
            rules: [{
              required: true,
              message: '文档库封面必填',
            },{
              pattern: /(((http|https)\:\/\/)|(www)){1}[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\&\.\/\?\:@\-_=#])*/,// eslint-disable-line
              message: 'url 格式错误'
            },{
              validator: async (rule, value, callback) => {
                try {
                  await testImage(value);
                  callback();
                } catch (e) {
                  callback('图片地址无效');
                }
              },
            }],
            initialValue: this.props.initialValueMap.BusinessIcon
          }
        },
        childrenAfter: UploadImg(this.uploadPoster,this.props.initialValueMap.BusinessIcon)
      },
      children: (<Input maxLength={8182} placeholder="请输入封面图片路径"/>),
    },
    Status: {
      itemProps: {
        ...itemLayout,
        label: '文档库状态',
        getFieldFParam: {
          name: 'Status',
          config: {
            rules: [{
              required: true,
              message: '状态必选',
            }],
            initialValue: this.props.initialValueMap.Status
          }
        }
      },
      children: (<RadioGroup><Radio value="online" disabled={this.props.disabledOnline}>上线</Radio><Radio
        value="offline">下线</Radio></RadioGroup>)
    },
    // 公开度
    Scope: {
      itemProps: {
        ...itemLayout,
        label: '可见性',
        getFieldFParam: {
          name: 'Scope',
          config: {
            rules: [{
              required: true,
              message: '可见性必选',
            }],
            initialValue: this.props.initialValueMap.Scope
          }
        }
      },
      children: (<RadioGroup><Radio value="public">任何人都可见</Radio><Radio value="private">仅头条内网可见</Radio></RadioGroup>)
    },
  }

  formatData() {
    const values = this.props.form.getFieldsValue();
    const format = {};
    Object.keys(values).forEach(key => {
      let value = values[key];
      if (typeof value === 'string') value = value.trim();
      if (this.formConfig[key] && this.formConfig[key].formatValue) {
        format[key] = this.formConfig[key].formatValue(value);
      } else format[key] = value;
    });
    return format;
  }

  onOk = () => {
    this.props.form.validateFields((err) => {
      if (!err) this.props.onOk({ BusinessID: this.props.business.BusinessID, ...this.formatData() });
    });
  }

  render() {
    return (
      <Modal
        title={this.props.isEdit ? '编辑文档库' : '新建文档库'}
        visible={this.props.visible}
        onOk={this.onOk}
        onCancel={this.props.onCancel}
        confirmLoading={this.props.confirmLoading}
        destroyOnClose
      >
        <Form layout="horizontal">
          {
            Object.keys(this.formConfig).map(itemKey => {
              return (
                <EasyFormItem key={itemKey} {...this.formConfig[itemKey].itemProps}>
                  {this.formConfig[itemKey].children}
                </EasyFormItem>);
            })
          }
        </Form>
      </Modal>
    );
  }
}

export default BusinessForm;