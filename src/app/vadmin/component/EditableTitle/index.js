import React, { Component } from 'react';
import { Button,Input,message } from 'antd';
import style from './index.less';
import PropTypes from 'prop-types';

class EditableTitle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      value: ''
    };
  }

  editTitle = () => {
    this.setState({
      isEdit: !this.state.isEdit,
      value: this.props.title
    });
  }

  inputChange = (e) => {
    this.setState({
      value: e.target.value
    });
  }

  edit = (e) => {
    e.stopPropagation();
    if (this.state.value === ''){
      message.error('文档标题不能为空！');
      return;
    }
    // 关闭编辑框并且修改了内容才触发 onEdit 事件
    if (this.state.isEdit && this.state.value !== this.props.title) {
      this.props.onEdit(this.state.value);
    }
    this.setState({
      isEdit: !this.state.isEdit,
    });
  }

  render() {
    return (
      <div className={style.title}>
        { this.state.isEdit ? <Input
          className={style.input}
          value={this.state.value}
          ref={(input) => {
            input != null && input.focus();
          }}
          onClick={(e)=>{ e.stopPropagation(); }}
          onChange={this.inputChange}
          onBlur={this.edit}
          onPressEnter={this.edit}/>
          : this.props.title }
        <Button icon="edit" onClick={this.editTitle} className={style.edit}/>
      </div>
    );
  }
}

EditableTitle.defaultProps = {
  title: '',
  onEdit: () => {}
};

EditableTitle.propTypes = {
  title: PropTypes.string,
  onEdit: PropTypes.func
};

export default EditableTitle;