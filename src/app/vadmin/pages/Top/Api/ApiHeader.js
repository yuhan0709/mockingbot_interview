import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button,Input } from 'antd';
import ApiForm from './ApiForm';
import style from './index.less';

const Search = Input.Search;

class ApiHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  static propTypes = {
    addApi: PropTypes.func,
    publishApi: PropTypes.func,
    searchApi: PropTypes.func
  }
  static defaultProps = {
    addApi: () => {},
    publishApi: () => {},
    searchApi: ()=>{}
  }

  add = () => {
    this.setState({ apiForm: {
      key: +new Date(),
      visible: true,
      disabledOnline: false,
      confirmLoading: false,
    } });
  }

  hideApiForm = () => {
    this.setState({ apiForm: { ...this.state.apiForm, visible: false } });
  }

  addApi = async (data) => {
    this.setState({ apiForm: { ...this.state.apiForm, confirmLoading: true } });
    try {
      await this.props.addApi(data);
      this.setState({ apiForm: { ...this.state.apiForm, visible: false, confirmLoading: false } });
    } catch (e) {
      this.setState({ apiForm: { ...this.state.apiForm, confirmLoading: false } });
    }
  }

  render() {
    return (
      <div className={style.apiHeader}>
        <section>
          <Button type="primary" style={{ marginRight: '10px' }} icon="plus" onClick={this.add}>新增API</Button>
          <Button type="primary" onClick={this.props.publishApi}>发布</Button>
        </section>
        <ApiForm
          onOk={this.addApi}
          onCancel={this.hideApiForm}
          {...this.state.apiForm}
        />
        <Search
          placeholder="输入API名称/Action"
          enterButton="搜索"
          onSearch={this.props.searchApi}
        />
      </div>
    );
  }
}

export default ApiHeader;