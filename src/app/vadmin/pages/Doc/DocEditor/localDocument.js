import React from 'react';
import { Drawer, Button } from 'antd';
import moment from 'moment';
import style from './style.less';
import PreviewForm from './preview';
import PropTypes from 'prop-types';

const NOOP = () => {};
export default class LocalDocument extends React.PureComponent{
  constructor(props){
    super(props);
    this.state = {
      showPreview: false,
      markDownString: '',
    };
  }

  static defaultProps = {
    onClose: NOOP,visible: false,document: [],onEdit: NOOP
  }

  static propTypes = {
    onClose: PropTypes.func,visible: PropTypes.bool,document: PropTypes.array,onEdit: PropTypes.func
  }
  preview = (content) => {
    this.setState({
      showPreview: true,
      markDownString: content,
    });
  };

  hidePreview = () => {
    this.setState({
      showPreview: false,
      markDownString: '',
    });
  }

  render(){
    const { onClose,visible,document,onEdit } = this.props;
    return <div>
      <Drawer
        title="本地文档历史"
        placement="right"
        closable={false}
        width={450}
        onClose={onClose}
        visible={visible}
        className={style['local-document']}
      >
        {document.map(d => <div key={d.id}>
          保存时间：{moment(d.SaveTime).format('YYYY-MM-DD HH:mm:ss')}
          <Button type="primary" onClick={()=>{ this.preview(d.Content); }}>
            预览
          </Button>
          <Button onClick={()=>{ onEdit(d.Content); }}>
            编辑
          </Button>
          <PreviewForm hideModal={this.hidePreview} visible={this.state.showPreview}
            markDownString={this.state.markDownString}/>
        </div>)}
      </Drawer>
    </div>;
  }
}