import React, { Component } from 'react';
import { Modal,Button,Form,Select } from 'antd';
import PropTypes from 'prop-types';
import { codes } from './constant';

const NOOP = () => {};
const FormItem = Form.Item;
const Option = Select.Option;
const itemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15, offset: 1 },
};


class ComponentModal extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    componentCode: codes[0].code
  }

  save = () => {
    this.props.onSave(this.state.componentCode);
  }

  handleSelectChange = (value) => {
    this.setState({
      componentCode: value
    });
  }

  render() {
    const { props } = this;
    return <Modal
      title="插入前端组件"
      visible={props.showModal}
      footer={
        <div>
          <Button key="cancel" onClick={props.onCancel}>取消</Button>
          <Button key="submit" type="primary" onClick={this.save}>确认</Button>
        </div>
      }
      onCancel={props.onCancel}
    >
      <Form layout="horizontal">
        <FormItem label="组件类型" {...itemLayout}>
          <Select value={this.state.componentCode} onChange={this.handleSelectChange}>
            {codes.map(code=> <Option key={code.title} value={code.code}>{code.title}</Option>)}
          </Select>
        </FormItem>
      </Form>
    </Modal>;
  }
}

ComponentModal.defaultProps = {
  showModal: false,
  onCancel: NOOP,
  onSave: NOOP
};

ComponentModal.propTypes = {
  showModal: PropTypes.bool,
  onCancel: PropTypes.func,
  onSave: PropTypes.func
};

export default ComponentModal;