import React, { PureComponent } from 'react';
import { Button, Modal, Row, Col, Icon, Alert } from 'antd';
import PropTypes from 'prop-types';
import style from './index.less';
import LightButton from '@component/LightButton';

const warnInfo = '这是唯一一次保存AK的机会，请下载凭证！';
export default class CreateKey extends PureComponent {
  static propTypes = {
    disabled: PropTypes.bool,
    createKey: PropTypes.func,
  }
  static defaultProps = {
    disabled: true,
    createKey: () => {}
  }
  state = {
    key: {},
    visible: false,
    showKey: false,
    createLoading: false,
  }
  clickCreateKey = async () => {
    this.setState({
      createLoading: true,
    });
    try {
      const success = await this.createKey();
      this.setState({
        visible: success,
        createLoading: false,
      });
    } catch (e) {
      this.setState({
        createLoading: false,
      });
    }
  }
  createKey = async () => {
    const res = await this.props.createKey();
    if (!res) return res;
    const key = res;
    this.setState({
      key,
    });
    return true;
  }
  hideModal = () => {
    this.setState({
      visible: false,
      key: {}
    });
  }
  downloadKey = () => {
    const {
      AccessKeyId,
      SecretAccessKey,
    } = this.state.key;
    const content = `AccessKeyId: ${AccessKeyId}\nSecretAccessKey ${SecretAccessKey}`;
    const aLink = document.createElement('a');
    const blob = new Blob([content]);
    aLink.download = 'AccessKey.txt';
    aLink.href = URL.createObjectURL(blob);
    aLink.click();
    setTimeout(this.hideModal, 1000);
  }
  toggleFlag = () => {
    this.toggling = false;
  }
  toggleKey = () => {
    if (this.toggling) return;
    this.toggling = true;
    this.setState({
      showKey: !this.state.showKey
    }, this.toggleFlag);
  }
  render() {
    const {
      key = {},
      visible = false,
      showKey,
      createLoading,
    } = this.state;
    return <div className={style['create-btn']}>
      <Button
        disabled={this.props.disabled}
        onClick={this.clickCreateKey}
        loading={createLoading}
        type="primary"
      >新建密钥</Button>
      <Modal
        title="生成密钥"
        visible={visible}
        onOk={this.downloadKey}
        onCancel={this.hideModal}
        okText="下载凭证"
        destroyOnClose
      >
        <div className={style.modal}>
          <Alert
            type="warning"
            message={warnInfo}
            showIcon
            className={style.alert}
          />
          <Row key="id" className={style['modal-title']}>
            <Col span={8} className={style.label}>
              <Icon className={style.icon} type="check-circle" />
            </Col>
            <Col span={10} offset={2}>
              <div className={style.successinfo}>新建AccessKey成功！</div>
              <LightButton onClick={this.toggleKey}>查看AccessKey详情</LightButton>
            </Col>
          </Row>
          {
            showKey && [
              <Row key="id">
                <Col className={style.label} span={8}>AccessKeyID: </Col>
                <Col span={10} offset={2}>{key.AccessKeyId}</Col>
              </Row>,
              <Row key="key">
                <Col className={style.label} span={8}>密钥: </Col>
                <Col span={10} offset={2}>{key.SecretAccessKey}</Col>
              </Row>
            ]
          }
        </div>
      </Modal>
    </div>;
  }
}
