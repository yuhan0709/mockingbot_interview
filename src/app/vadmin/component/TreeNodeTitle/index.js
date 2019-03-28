import React, { PureComponent } from 'react';
import { Button, Input, Modal, message, Tooltip,Icon } from 'antd';
import PropTypes from 'prop-types';
import style from './style.less';

class TreeNodeTitle extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: this.props.defaultEdit,
      fromAdd: this.props.fromAdd,
      value: this.props.title,
    };
  }

  add = (e,type) => {
    e.stopPropagation();
    this.props.onPlus(e,type);
  }

  editTitle = () => {
    this.setState({
      isEdit: !this.state.isEdit,
      value: this.props.title,
      fromAdd: false
    });
  }

  edit = (e) => {
    e.stopPropagation();
    if (this.state.value === '') {
      message.error('文档标题不能为空！');
      return;
    }
    // 关闭编辑框才触发 onEdit 事件
    if (this.state.isEdit) {
      this.props.onEdit(this.state.value, !!this.state.fromAdd);
    }
    this.setState({
      isEdit: !this.state.isEdit,
      fromAdd: false
    });
  }

  delete = (e) => {
    e.stopPropagation();
    Modal.confirm({
      title: '删除文档',
      content: '确认要执行删除操作吗？',
      okType: 'danger',
      onOk: () => {
        this.props.onDelete();
      },
      onCancel() {
      },
    });
  }

  inputChange = (e) => {
    this.setState({
      value: e.target.value
    });
  }

  render() {
    const {
      title,
      className,
      status,
    } = this.props;
    const bgColorMap = {
      online: '#31F031',
      offline: '#ffe318',
      unpublish: 'red'
    };
    return (
      <div className={className}>
        {this.state.isEdit ? <Input
          className={style.input}
          value={this.state.value}
          ref={(input) => {
            input != null && input.focus();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={this.inputChange}
          onBlur={this.edit}
          onPressEnter={this.edit}/>
          : <span><Icon theme={this.props.isDirectory ? 'filled' : 'outlined'} className={this.props.isDirectory ? style.folder : style.file} type={this.props.isDirectory ? 'folder' : 'file'}/> {title}</span>
        }
        {this.props.isDirectory ? null : <div className={style.point} style={{ backgroundColor: bgColorMap[status] }}></div>}
        <img
          style={{ width: 20 }}
          src={
            this.props.visible
              ? 'http://tosv.byted.org/obj/tostest/visible.svg'
              : 'http://tosv.byted.org/obj/tostest/invisible.svg'
          }
        />
        <Tooltip title="重命名">
          <Button icon="edit" onClick={this.editTitle}/>
        </Tooltip>
        {this.props.isDirectory ?
          <React.Fragment>
            <Tooltip title="新建目录">
              <Button icon="folder" onClick={(e) => this.add(e, 'directory')}/>
            </Tooltip>
            <Tooltip title="新建文件">
              <Button icon="file-text" onClick={(e) => this.add(e, 'file')}/>
            </Tooltip>
          </React.Fragment>
          : null
        }
        <Button icon="delete" style={{ color: 'red' }} onClick={this.delete}/>
      </div>
    );
  }
}

TreeNodeTitle.defaultProps = {
  title: '',
  className: '',
  status: 'offline',
  defaultEdit: false,
  fromAdd: false,
  isDirectory: false,
  onPlus: () => {
  },
  onEdit: () => {
  },
  onDelete: () => {

  }
};

TreeNodeTitle.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  status: PropTypes.string,
  defaultEdit: PropTypes.bool,
  fromAdd: PropTypes.bool,
  isDirectory: PropTypes.bool,
  onPlus: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default TreeNodeTitle;