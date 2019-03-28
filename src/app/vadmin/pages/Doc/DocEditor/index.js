import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col,message } from 'antd';
import Directory from './directory';
import Editor from './editor';
import { bindActionCreators } from 'redux';
import DocActions from '../../../redux/actions/Docs';
import { withRouter } from 'react-router';
import Apis from '../../../util/request';

@withRouter
@connect((state) => {
  return {
    documentCategory: state.Docs.Category.tree,
    documentData: state.Docs.Category.line,
    content: state.Docs.DocContent,
    keyWords: state.Docs.DocKeyWords,
    versionList: state.Docs.VersionList,
    business: state.Docs.Business
  };
}, (dispatch) => ({
  actions: bindActionCreators(DocActions, dispatch)
}))
class DocEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      documentID: null,
      documentTitle: '',
      documentVersion: null,
      editor: null
    };
  }

  checkVersion = (version) => {
    this.setState({
      documentVersion: version
    });
  }

  select = async (id) => {
    if (id == null){
      this.props.documentData.length === 0 ? message.info('请新建文档') : message.warn('未选中文档');
      return;
    }
    // 拿到这个文档对象，获取 Title 和 Version
    const doc = this.props.documentData.find(e => +e.DocumentID === +id) || {};
    // Info：选择的如果是目录，不让点
    if (doc.IsDir){
      // message.info('目录不能被选中');
      return;
    }
    await this.props.actions.getDoc(+id, this.props.match.params.BusinessID);
    this.setState({
      documentID: +id || null,
      documentTitle: doc.Title,
      documentVersion: doc.DocVersion
    });
    // window.location.hash = id;
    this.props.history.replace(`?DocumentId=${id}`);
  }

  getEditor = (editor) => {
    this.setState({
      editor
    });
  }

  render() {
    console.log(this.props);
    Apis.GetBusinessManagers({ BusinessName: this.props.business.Name });
    return (
      <div>
        <Row>
          <Col span={6}>
            <Directory
              {...this.props}
              editor={this.state.editor}
              documentID={this.state.documentID}
              onSelect={this.select}
              onChangeVersion={this.checkVersion}
            />
          </Col>
          <Col span={18}>
            <Editor {...this.state} {...this.props} onChangeVersion={this.checkVersion} onEditorInit={this.getEditor}/>
          </Col>
        </Row>
      </div>
    );
  }
}

export default DocEditor;