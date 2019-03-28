import { message } from 'antd';
import { uploadImage } from '../../../../server/api/vadmin/uploadFile';
import { Mb } from '../../util/valueFormat';
import React from 'react';

export const addImage = (blob, callback) => {
  var reader = new FileReader();
  const uploadMaxSize = 3 * Mb;
  if (blob.size > uploadMaxSize) {
    message.error('文件大小超出${uploadSizeName}限制');
    return false;
  }
  if (!blob.name.match(/(png|jpeg|jpg)/)) {
    message.error(<span>只支持<span>png/jpeg/jpg</span>文件</span>);
    return false;
  }
  upload(reader,blob,callback);
};

export function upload(reader,blob,callback){
  if (!blob.name.match(/^(\w|\.)*$/g)) {
    message.error(<span>文件名只支持<span>英文、数字、下划线</span></span>);
    return false;
  }
  message.info('文件开始上传');
  reader.onload = async (event) => {
    try {
      const res = await uploadImage(blob.name, event.target.result);
      if (res.filepath) {
        callback(res.filepath);
      }
      switch (res.status) {
      case 'SUCCESS':
        message.success('上传成功');
        break;
      case 'EXISTED':
        message.warning('文件已存在，已自动填上地址');
        break;
      case 'TIMEOUT':
        message.error('上传超时');
        break;
      default:
        console.error(res);
        message.error(`上传失败 ${res.err}`, 10);
      }
    } catch (e) {
      console.error(e);
      message.error(`上传失败${e && e.statusText ? (' ' + e.statusText) : ''}`, 5);
    }
  };
  reader.onerror = function () {
    message.error('上传失败');
  };
  reader.onabort = function () {
    message.error('上传失败');
  };
  reader.readAsDataURL(blob);
}

export function testImage(url, timeout = 5000) {
  return new Promise(function (resolve, reject) {
    let timer = null;
    const img = new Image();
    img.onerror = img.onabort = function () {
      clearTimeout(timer);
      reject('error');
    };
    img.onload = function () {
      clearTimeout(timer);
      resolve('success');
    };
    timer = setTimeout(function () {
      // reset .src to invalid URL so it stops previous
      // loading, but doesn't trigger new load
      img.src = '//!!!!/test.jpg';
      reject('timeout');
    }, timeout);
    img.src = url;
  });
}