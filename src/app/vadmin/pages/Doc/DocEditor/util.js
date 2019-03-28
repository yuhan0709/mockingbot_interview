import $ from 'jquery';
import { Modal, Upload, Icon,message } from 'antd';
import React from 'react';
import { upload } from '../util';
import { Mb } from '../../../util/valueFormat';

// 目录树
export const loop = (data, key, callback) => {
  data.forEach((item, index, arr) => {
    //  DocumentID 后端的数据类型是整型,前端树的 key 是字符串
    if (+item.DocumentID === +key) {
      return callback(item, index, arr);
    }
    if (item.children) {
      return loop(item.children, key, callback);
    }
  });
};

export const removeDouble = (arr, ...args) => {
  return Array.from(new Set(arr.concat(args)));
};

// 文档本地历史
export const MaxLocalDocumentLength = 15;

export const getLocalDocuments = (db, DocumentID) => {
  try {
    const transaction = db.transaction(['customers'], 'readonly');
    const store = transaction.objectStore('customers');
    const keyRange = IDBKeyRange.only(DocumentID);
    const index = store.index('DocumentID');
    const req = index.openCursor(keyRange);

    return new Promise((resolve, reject) => {
      const result = [];
      req.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Do something with the matches.
          result.push(cursor.value);
          cursor.continue();
        } else {
          // console.log('获取成功 ');
          result.sort(saveTimeSort);
          resolve(result);
        }
      };
      req.onerror = (event) => {
        console.error('获取失败');
        reject(event);
      };
    });
  } catch (e) {
    console.log('未知错误',DocumentID);
    return Promise.reject(e);
  }
};

export const setLocalDocuments = (db, localDocuments, document = {}) => {
  if (localDocuments[localDocuments.length - 1] && document.Content === localDocuments[localDocuments.length - 1].Content){
    console.log('内容未更新，不进行本地保存。');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['customers'], 'readwrite');
    const store = transaction.objectStore('customers');
    let req = {};

    // Info: 长度超过用 put，没超过用 add
    if (localDocuments.length >= MaxLocalDocumentLength) {
      const id = localDocuments.sort(saveTimeSort)[0].id;
      req = store.put({
        ...document,
        id
      });
    } else {
      req = store.add(document);
    }

    req.onsuccess = () => {
      // console.log('自动保存成功');
      resolve();
    };
    req.onerror = (event) => {
      message.error('自动保存失败');
      reject(event);
    };
  });
};

function saveTimeSort(a, b) {
  return new Date(a.SaveTime).getTime() - new Date(b.SaveTime).getTime();
}

// 得到查询字符串参数集合
export function GetUrlParms() {
  let args = {};
  let query = location.search.substring(1);//获取查询串
  let pairs = query.split('&');//在逗号处断开
  for (let i = 0; i < pairs.length; i++) {
    let pos = pairs[i].indexOf('=');//查找name=value
    if (pos == -1) continue;//如果没有找到就跳过
    let argname = pairs[i].substring(0, pos);//提取name
    let value = pairs[i].substring(pos + 1);//提取value
    args[argname] = decodeURIComponent(value);//存为属性
  }
  return args;
}

// 编辑器
const NOOP = () => {};
export function enhanceEditor(editor,callback = NOOP) {
  const Dragger = Upload.Dragger;
  const toolbar = editor.getUI().getToolbar();
  let modal = null;

  const addFile = (blob, callback) => {
    const reader = new FileReader();
    const uploadMaxSize = 1024 * Mb;
    if (blob.size > uploadMaxSize) {
      message.error('文件大小超出 1G ${uploadSizeName}限制');
      return false;
    }
    upload(reader,blob,callback);
  };
  const customRequest = ({ file })=>{
    addFile(file, (filePath) => {
      // console.log('filePath',filePath);
      const code = `<a href=${filePath} target="_blank" download>${file.name}</a>`;
      if (modal){
        modal.destroy();
        callback(code);
      }
    });
  };

  editor.eventManager.addEventType('uploadFile');
  editor.eventManager.listen('uploadFile', () => {
    modal = Modal.confirm({
      iconType: 'info-circle',
      title: '上传文件',
      content: <Dragger customRequest={customRequest}>
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">点击或者拖拽完成上传</p>
      </Dragger>,
      async onOk() {
        await callback();
      },
      onCancel() {},
    });
  });
  toolbar.addButton({
    name: 'uploadFile',
    event: 'uploadFile',
    tooltip: '上传文件',
    $el: $('<div class="our-button-class"><i class="fas fa-file"></i></div>')
  },13);
}