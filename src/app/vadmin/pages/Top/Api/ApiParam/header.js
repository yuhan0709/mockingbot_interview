import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import Form from './form';
import style from './index.less';
import { withRouter } from 'react-router';
import Request from '../../../../util/request';
const { GetApi } = Request;
// const Search = Input.Search;
@withRouter
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
      ApiName: ''
    };
  }

  static propTypes = {
    add: PropTypes.func,
    search: PropTypes.func
  }
  static defaultProps = {
    add: () => {
    },
    search: () => {
    }
  }

  async componentDidMount(){
    const { ApiName } = await GetApi({ BusinessID: this.props.match.params.ServiceId,ApiId: this.props.match.params.ApiId });
    this.setState({
      ApiName
    });
  }

  showForm = () => {
    this.setState({ form: {
      key: +new Date(),
      visible: true,
      disabledOnline: false,
      confirmLoading: false,
    } });
  }

  add = async (data) => {
    this.setState({ form: { ...this.state.form, confirmLoading: true } });
    try {
      await this.props.add(data);
      this.setState({ form: { ...this.state.form, visible: false, confirmLoading: false } });
    } catch (e) {
      this.setState({ form: { ...this.state.form, confirmLoading: false } });
    }
  }

  hideForm = () => {
    this.setState({ form: { ...this.state.form, visible: false } });
  }

  render() {
    return (
      <div className={style.header}>
        <section>
          <h3>{this.state.ApiName}</h3>
          <Button type="primary" style={{ marginRight: '10px' }} icon="plus" onClick={this.showForm}>新增API参数</Button>
        </section>
        <Form
          onOk={this.add}
          onCancel={this.hideForm}
          {...this.state.form}
        />
        {/*<Search*/}
        {/*placeholder="请输入搜索条件"*/}
        {/*enterButton="搜索"*/}
        {/*onSearch={this.props.search}*/}
        {/*/>*/}
      </div>
    );
  }
}

export default Header;