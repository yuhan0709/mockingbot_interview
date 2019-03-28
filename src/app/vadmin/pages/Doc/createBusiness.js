import style from './index.less';
import React, { Component } from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import BusinessForm from './businessForm';

export default class CreateBusiness extends Component {
  state = {
    visible: false,
    confirmLoading: false,
  }
  static propTypes = {
    createBusiness: PropTypes.func,
  }
  static defaultProps = {
    createBusiness: () => {}
  }
  clickCreateBusiness = () => {
    this.setState({ visible: true });
  }
  createBusiness = async (data) => {
    this.setState({ confirmLoading: true });
    try {
      await this.props.createBusiness({ Type: 1, ...data });
      this.setState({ visible: false, confirmLoading: false });
    } catch (e) {
      this.setState({ confirmLoading: false });
    }
  }
  hideForm = () => {
    this.setState({ visible: false });
  }
  render() {
    return <div className={style.create}>
      <Button type="primary" onClick={this.clickCreateBusiness}>+新建文档库</Button>
      <BusinessForm
        confirmLoading={this.state.confirmLoading}
        visible={this.state.visible}
        onOk={this.createBusiness}
        onCancel={this.hideForm}
        appendInfo={this.props.appendInfo}
      />
    </div>;
  }
}