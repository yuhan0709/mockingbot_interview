import React, { Component } from 'react';
import { Modal, Switch } from 'antd';
import Apis from '../../util/request';


class ServiceModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      lock: [],
      confirmLoading: false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.target !== nextProps.target){
      const data = [];
      nextProps.serviceKey.map((key,index) => {
        data[index] = false;
        if (nextProps.target.Tags){
          nextProps.target.Tags.map(tag => {
            if (tag.TagKey === key) {
              data[index] = true;
            }
          });
        }
      });
      this.setState({
        data,
        lock: [...data]
      });
    }
  }

  onChange = i => {
    const data = [...this.state.data];
    data[i] = !data[i];
    this.setState({
      data
    });
  }

  confirm = async () => {
    let boo = false;
    this.state.data.forEach((ele,i) => {
      if (this.state.lock[i] !== ele) {
        boo = true;
      }
    });
    if (boo) {
      this.setState({
        confirmLoading: true
      });
      const list = this.props.serviceKey.filter((_,i) => {
        return this.state.data[i];
      });
      await Apis.SetAccountServiceOn({ Services: list.toString(),AccountID: this.props.target.Id }).finally(() => {
        this.setState({
          confirmLoading: false
        });
      });
    }
    this.props.hideModal();
    this.props.refresh();
  }

  render() {
    let service = <tr></tr>;
    if (this.props.serviceKey && this.props.serviceKey.length) {
      service = this.props.serviceKey.map((key,index) => {
        key = this.props.serviceMap[key] ? this.props.serviceMap[key] : key;
        return (
          <tr key={key}>
            <td style={{ paddingLeft: 30 }}>{key}</td>
            <td style={{ paddingLeft: 30,height: 34 }}>
              <Switch
                checkedChildren="开"
                unCheckedChildren="关"
                checked={this.state.data[index]}
                disabled={this.state.lock[index]}
                onChange={()=>{ this.onChange(index); }}
              />
            </td>
          </tr>
        );
      });
    }

    return (
      <Modal
        title="云服务管理"
        visible={this.props.visible}
        onOk={this.confirm}
        onCancel={this.props.hideModal}
        confirmLoading={this.state.confirmLoading}
        width='360px'
      >
        <table>
          <tbody>
            {service}
          </tbody>
        </table>
      </Modal>
    );
  }

}

export default ServiceModal;