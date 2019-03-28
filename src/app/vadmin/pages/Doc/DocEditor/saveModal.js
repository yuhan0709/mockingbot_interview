import React  from 'react';
import {  Modal, Button } from 'antd';

export default function SaveModal(props) {
  return <Modal
    visible={props.showModal}
    footer={
      <div>
        <Button key="back" onClick={props.onUnSave}>不保存</Button>
        <Button key="cancel" onClick={props.onCancel}>取消</Button>
        <Button key="submit" type="primary" onClick={props.onSave}>保存</Button>
      </div>
    }
    onCancel={props.onCancel}
  >
    <div><h2>您要保存对{`"${props.title}"`}文档所做的更改吗？</h2><p>如果不保存，您更改的内容将会丢失。</p></div>
  </Modal>;
}