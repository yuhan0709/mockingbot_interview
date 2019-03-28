import React, { Component } from 'react';
import { Tabs, Alert, message } from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import TopActions from '../../../redux/actions/Top';
import { bindActionCreators } from 'redux';
import CreateKey from './createKey';
import KeyList from './keyList';

const TabPane = Tabs.TabPane;
const KeyLimit = 2;
const warningMsg = 'Access Key ID和Access Key Secret是您访问头条云API的密钥，具有该账户完全的权限，且最多只能创建两个。请您妥善保管和定期更换密钥，并及时删除原秘钥。';

@withRouter
@connect((state) => ({
  AccessKeys: state.Top.AccessKeys
}), (dispatch) => ({
  actions: bindActionCreators(TopActions, dispatch)
}))
export default class KeyManage extends Component {
  constructor(props) {
    super(props);
  }
  async componentDidMount() {
    const ServiceId = this.props.match.params.ServiceId;
    await this.props.actions.getAks({ BusinessID: ServiceId,ServiceId });
  }
  createKey = async () => {
    if (this.props.AccessKeys.length >= KeyLimit) {
      message.error('只能至多同时拥有两个密钥', 5);
      return false;
    }
    const ServiceId = this.props.match.params.ServiceId;
    const key = await this.props.actions.createAK({ BusinessID: ServiceId,ServiceId });
    message.success('新建密钥成功');
    await this.props.actions.getAks({ BusinessID: ServiceId,ServiceId });
    return key;
  }
  updateKey = async (AccessKeyId, Status) => {
    const ServiceId = this.props.match.params.ServiceId;
    await this.props.actions.updateAK({ BusinessID: ServiceId,ServiceId,AccessKeyId, Status: Status.value });
    message.success(`成功修改密钥状态为 ${Status.label}`);
    await this.props.actions.getAks({ BusinessID: ServiceId,ServiceId });
  }
  deleteKey = async (AccessKeyId) => {
    const ServiceId = this.props.match.params.ServiceId;
    await this.props.actions.deleteAK({ BusinessID: ServiceId,ServiceId,AccessKeyId });
    message.success('删除密钥成功');
    await this.props.actions.getAks({ BusinessID: ServiceId,ServiceId });
  }
  render() {
    return <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="密钥管理" key="1">
          <Alert type="warning" showIcon message={warningMsg} />
          <CreateKey
            createKey={this.createKey}
            disabled={this.props.AccessKeys.length >= KeyLimit}
          />
          <KeyList
            data={this.props.AccessKeys}
            updateKey={this.updateKey}
            deleteKey={this.deleteKey}
          />
        </TabPane>
      </Tabs>
    </div>;
  }
}
