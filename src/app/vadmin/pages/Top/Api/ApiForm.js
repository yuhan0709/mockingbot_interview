import React, { Component } from 'react';
import EasyForm from '@component/EasyForm';
import { Form, Input, Radio, Modal } from 'antd';
import PropTypes from 'prop-types';
import { chineseAndEnglish, pureEnglish, PSMReg } from '@util/regex';
import style from './index.less';

// const Option = Select.Option;
const RadioGroup = Radio.Group;
const EasyFormItem = EasyForm.Item;
const initialValueMap = {
  ApiName: '',
  Action: '',
  ApiDesc: '',
  ApiGroup: '',
  Psm: '',
  Path: '/',
  Method: 'GET',
  IsAuth: 1,
  IsInner: 0,
  Version: '',
  Timeout: 1000
};
const itemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15, offset: 1 },
};

@EasyForm.create()
class ApiForm extends Component {
  static propTypes = {
    isEdit: PropTypes.bool,
    isView: PropTypes.bool,
    disabledOnline: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    visible: PropTypes.bool,
    api: PropTypes.object,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    initialValueMap: PropTypes.object,
  }
  static defaultProps = {
    isEdit: false,
    isView: false,
    disabledOnline: true,
    visible: false,
    confirmLoading: false,
    initialValueMap,
    api: {},
    onOk: () => {
    },
    onCancel: () => {
    }
  }
  formConfig = {
    ApiName: {
      itemProps: {
        ...itemLayout,
        label: 'API名称',
        getFieldFParam: {
          name: 'ApiName',
          config: {
            rules: [{
              required: true,
              message: 'API名称必填，最多输入64个字符',
            }, {
              pattern: chineseAndEnglish,
              message: '只允许使用中英文'
            }],
            initialValue: this.props.initialValueMap.ApiName
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.ApiName}</p> :
        <Input maxLength={64} placeholder="请输入API中文名称"/>)
    },
    Action: {
      itemProps: {
        ...itemLayout,
        label: 'Action名称',
        getFieldFParam: {
          name: 'Action',
          config: {
            rules: [{
              required: true,
              message: 'Action名称必填，最多输入64个字符',
            }, {
              pattern: pureEnglish,
              message: '只允许使用英文大小写'
            }],
            initialValue: this.props.initialValueMap.Action
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.Action}</p> :
        <Input maxLength={64} placeholder="请输入Action名称" disabled={this.props.isEdit}/>)
    },
    ApiDesc: {
      itemProps: {
        ...itemLayout,
        label: 'API描述',
        getFieldFParam: {
          name: 'ApiDesc',
          config: {
            initialValue: this.props.initialValueMap.ApiDesc
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.ApiDesc}</p> :
        <Input maxLength={128} placeholder="请输入API描述"/>)
    },
    ApiGroup: {
      itemProps: {
        ...itemLayout,
        label: 'API分组',
        getFieldFParam: {
          name: 'ApiGroup',
          config: {
            initialValue: this.props.initialValueMap.ApiGroup
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.ApiGroup}</p> :
        <Input maxLength={10} placeholder="请输入API分组"/>)
    },
    Psm: {
      itemProps: {
        ...itemLayout,
        label: 'PSM',
        getFieldFParam: {
          name: 'Psm',
          config: {
            rules: [{
              pattern: PSMReg,
              message: '只允许三段式'
            }],
            initialValue: this.props.initialValueMap.Psm
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.Psm}</p> :
        <Input maxLength={1024} placeholder="请输入PSM"/>)
    },
    Path: {
      itemProps: {
        ...itemLayout,
        label: '请求path',
        getFieldFParam: {
          name: 'Path',
          config: {
            initialValue: this.props.initialValueMap.Path
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.Path}</p> :
        <Input maxLength={128} placeholder="请输入请求Path"/>)
    },
    // Method: {
    //   itemProps: {
    //     ...itemLayout,
    //     label: 'HTTP Method',
    //     getFieldFParam: {
    //       name: 'Method',
    //       config: {
    //         rules: [{
    //           required: true,
    //           message: 'HTTP方法必填',
    //         }],
    //         initialValue: this.props.initialValueMap.Method
    //       }
    //     }
    //   },
    //   children: (this.props.isView ? <p>{this.props.initialValueMap.Method}</p> :
    //     <Select>
    //       <Option value="GET">GET</Option>
    //       <Option value="POST">POST</Option>
    //     </Select>
    //   )
    // },
    IsAuth: {
      itemProps: {
        ...itemLayout,
        label: '是否前鉴权',
        getFieldFParam: {
          name: 'IsAuth',
          config: {
            rules: [{
              required: true,
              message: '状态必选',
            }],
            initialValue: this.props.initialValueMap.IsAuth + ''
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.IsAuth ? '是' : '否'}</p> :
        <RadioGroup><Radio value="1">是</Radio><Radio value="0">否</Radio></RadioGroup>)
    },
    IsInner: {
      itemProps: {
        ...itemLayout,
        label: '是否内部API',
        getFieldFParam: {
          name: 'IsInner',
          config: {
            rules: [{
              required: true,
              message: '状态必选',
            }],
            initialValue: this.props.initialValueMap.IsInner + ''
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.IsInner ? '是' : '否'}</p> :
        <RadioGroup><Radio value="1">是</Radio><Radio value="0">否</Radio></RadioGroup>)
    },
    Version: {
      itemProps: {
        ...itemLayout,
        label: '版本号',
        getFieldFParam: {
          name: 'Version',
          config: {
            rules: [{
              required: true,
              message: '版本号必填',
            }, {
              pattern: /\d{4}-\d{2}-\d{2}/g,
              message: '只允许如2018-08-01的版本号'
            }],
            initialValue: this.props.initialValueMap.Version
          }
        }
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.Version}</p> :
        <Input maxLength={10} placeholder="请输入版本号，如2018-08-01" disabled={this.props.isEdit}/>)
    },
    Timeout: {
      itemProps: {
        ...itemLayout,
        label: '读超时',
        getFieldFParam: {
          name: 'Timeout',
          config: {
            rules: [{
              required: true,
              message: '超时必填',
            }, {
              validator: (rule, value, callback) => {
                const time = Number(value);
                if (Number.isInteger(time) && time <= 120000) callback();
                else callback('只能为有效的数字，上限为120000 ms!');
              },
            }],
            initialValue: this.props.initialValueMap.Timeout
          }
        },
        extra: this.props.isView ? null : <span className={style.extra}>ms</span>
      },
      children: (this.props.isView ? <p>{this.props.initialValueMap.Timeout} ms</p> :
        <Input style={{ width: '90%' }} maxLength={6} placeholder="请输入读超时"/>)
    }
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
      if (!err) this.props.onOk({ BusinessID: this.props.api.ServiceId,ApiId: this.props.api.ApiId, ...this.formatData() });
    });
  }

  render() {
    return (
      <Modal
        title={this.props.isEdit ? '编辑API' : this.props.isView ? 'API基本信息' : '新建API'}
        visible={this.props.visible}
        onOk={this.onOk}
        onCancel={this.props.onCancel}
        confirmLoading={this.props.confirmLoading}
        footer={this.props.isView ? null : undefined}
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

export default ApiForm;