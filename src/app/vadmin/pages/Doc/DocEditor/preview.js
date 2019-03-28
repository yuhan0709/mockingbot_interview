import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import MarkDownPreview from '@component/MarkdownPreview';
import style from './style.less';

function escapeRegExp(string){
  return string.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$&');
  //$&表示整个被匹配的字符串
}
class PreviewForm extends PureComponent {
  static propTypes = {
    visible: PropTypes.bool,
    hideModal: PropTypes.func,
    markDownString: PropTypes.string,
    docTitle: PropTypes.string,
  }
  static defaultProps = {
    visible: false,
    hideModal: () => {},
    markDownString: '',
    docTitle: '',
  }
  render() {
    const {
      visible,
      hideModal,
      markDownString,
      docTitle,
    } = this.props;
    const titleMatcher = new RegExp(`^# ${escapeRegExp(docTitle)}\\s+\\n`, 'i');
    let noTitleContent = markDownString;
    if (markDownString && docTitle && markDownString.match(titleMatcher)) {
      noTitleContent = markDownString.replace(titleMatcher, '');
    }
    return (
      <Modal
        title="文档预览"
        visible={visible}
        onCancel={hideModal}
        onOk={hideModal}
        width={808}
        destroyOnClose
      >
        <div className={style.preview}>
          {docTitle && <div className={style['doc-header']}>
            <h1>{docTitle}</h1>
            <div>更新时间: {moment().format('YYYY-MM-DD HH:mm:ss')}</div>
          </div>}
          <MarkDownPreview className='markdown-body' markDownString={noTitleContent} />
        </div>
      </Modal>
    );
  }
}

export default PreviewForm;