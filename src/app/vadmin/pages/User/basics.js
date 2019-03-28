import React, { Component } from 'react';
import style from './index.less';
import { withRouter } from 'react-router';
import { Form } from 'antd';
import Apis from '../../util/request';
import moment from 'moment';

const FormItem = Form.Item;
const serviceMap = window.INIT_CONFIG.expenseConfig.Service;
@withRouter
class Basics extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    services: [],
    tags: [],
    Insider: false,
    ServiceTreeNodeId: '',
    account: {},
    profile: {}
  }

  componentDidMount() {
    this.getAccount();
    this.getProfile();
  }

  getAccount = async () => {
    const account = await Apis.GetAccountV2({ Identity: this.props.match.params.accountId, WithTag: true });
    let Insider = false;
    let ServiceTreeNodeId = '';
    const services = [];
    const tags = [];
    account.Tags.forEach(tag => {
      if (tag.TagKey === 'Insider') {
        Insider = true;
      } else if (tag.TagKey === 'ServiceOn') {
        services.push(tag.TagValue);
      } else if (tag.TagKey === 'ServiceTreeNodeId') {
        ServiceTreeNodeId = tag.TagValue;
      } else {
        tags.push(tag);
      }
    });
    this.setState({
      Insider,
      ServiceTreeNodeId,
      account,
      services,
      tags
    });
  }

  notNull(ele) {
    return ele ? ele : '--';
  }

  getProfile = async () => {
    const profile = await Apis.GetProfileV2({ AccountId: this.props.match.params.accountId });
    this.setState({
      profile
    });
  }

  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 18 },
        sm: { span: 18 },
      },
    };
    const { account,profile } = this.state;
    const nn = this.notNull;
    return (
      <div style={{ minWidth: '850px', marginBottom: 50, position: 'relative' }}>
        <div className={style.photo}>
          {account.Identity ? account.Identity.slice(0,1).toUpperCase() : ''}
        </div>
        <Form className={style.content}>
          <FormItem>
            <h3>基本信息</h3>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="用户ID"
          >
            <span>{account.Id}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="用户名"
          >
            <span>{account.Identity}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="手机号"
          >
            <span>{nn(account.Tel)}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="邮箱"
          >
            <span>{nn(account.Email)}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="认证信息"
          >
            <span>尚未实名认证</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="注册时间"
          >
            <span>{moment.unix(account.CreateTime).format('YYYY-MM-DD HH:mm:ss')}</span>
          </FormItem>
          <FormItem>
            <h3>业务信息</h3>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="所属行业"
          >
            <span>{nn(profile.Industry)}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="主营业务"
          >
            <span>{nn(profile.Business)}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="网址"
          >
            <span>{nn(profile.Website)}</span>
          </FormItem>
          <FormItem>
            <h3>联系信息</h3>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="国家/地区"
          >
            <span>{nn(profile.Nation)}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="所在地区"
          >
            <span>
              {profile.Province ? profile.Province + '/' + profile.City + '/' + profile.District : '--'}
            </span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="具体地址"
          >
            <span>{nn(profile.Address)}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="联系电话"
          >
            <span>{nn(profile.Tel)}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="传真"
          >
            <span>{nn(profile.Fax)}</span>
          </FormItem>
          <FormItem>
            <h3>标签信息</h3>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="服务树ID"
          >
            <span>{this.state.ServiceTreeNodeId || this.state.ServiceTreeNodeId === 0 ? this.state.ServiceTreeNodeId : '--'}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="是否为公司内部员工"
          >
            <span>{this.state.Insider ? '是' : '否'}</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="已开通服务"
          >
            <span>{
              this.state.services.length
                ? this.state.services.map(service => (serviceMap[service] ? serviceMap[service] : service)).toString()
                : '--'
            }</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="自定义标签"
          >
            <div style={{ paddingTop: '5px' }}>{
              this.state.tags
                ? (
                  this.state.tags.map(tag => (
                    <div className={style.tag} key={tag.TagKey + tag.TagValue} style={{
                      lineHeight: '30px',
                      margin: '0',
                      padding: '0',
                    }}>
                      <span>{tag.TagKey}：{tag.TagValue}</span>
                    </div>
                  ))
                )
                : '--'
            }</div>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(Basics);