import React, { Component } from 'react';
import { Button, Row, Col, Modal, message, Spin,Card,Form,Input,Divider,Tooltip, Dropdown, Menu, Radio, Alert } from 'antd';
import Version from './version';
import style from './style.less';
import { uploadImage } from '../../../../../server/api/vadmin/uploadFile';
import { formatByte, Mb } from '../../../util/valueFormat';
import PreviewForm from './preview';
import MarkdownEditor from '@component/MarkdownEditor';
import moment from 'moment';
import { Prompt } from 'react-router';
import { IndexDB } from '../../../util/indexdb';
import { getLocalDocuments,setLocalDocuments,enhanceEditor } from './util';
import LocalDocument from './localDocument';
import EditableTitle from '../../../component/EditableTitle';
import PropTypes from 'prop-types';

const uploadMaxSize = 3 * Mb;
const uploadSizeName = formatByte(uploadMaxSize);
const itemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20, offset: 1 },
};
const permission = window.INIT_CONFIG.permission || {};
const docPermission = permission.doc || {};
const RadioGroup = Radio.Group;

class Editor extends Component {
  timer = null
  db = null

  constructor(props) {
    super(props);
    this.state = {
      editor: {
        getValue: () => {
        }
      },
      keyWords: props.keyWords,
      showPrompt: false,
      loading: false,
      showVersion: false,
      showPreview: false,
      markDownString: '',
      localDocuments: [],
      Scope: 'private',
    };
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    const document = nextProps.documentData.find(e => +e.DocumentID === +nextProps.documentID) || {};
    this.setState({
      Scope: document.Scope
    });
    // 目录树切换节点之后
    if (this.props.documentID !== nextProps.documentID && nextProps.documentID != null) {
      if (this.db) {
        await this.refreshLocalDocuments(nextProps.documentID);
      }
    }
    // 草稿 prop 更新之后
    if (this.props.content !== nextProps.content) {
      const needUpdate = this.state.editor.getValue() !== nextProps.content;
      needUpdate && this.state.editor.setValue(nextProps.content);
      this.setState({
        showPrompt: nextProps.content !== this.state.editor.getValue()
      });
    }
    // 关键词更新之后
    if (this.props.keyWords !== nextProps.keyWords) {
      this.setState({
        keyWords: nextProps.keyWords
      });
    }
  }

  async componentDidMount() {
    const document = this.props.documentData.find(e => +e.DocumentID === +this.props.documentID) || {};
    this.setState({
      Scope: document.Scope
    });
    const indexDB = new IndexDB({
      name: 'vadmin-doc-history',
      storeName: 'customers',
      storeOptions: { keyPath: 'id', autoIncrement: true } ,
      storeInit: (objectStore) => {
        objectStore.createIndex('DocumentID', 'DocumentID', { unique: false });
        objectStore.createIndex('SaveTime', 'SaveTime', { unique: false });
      }
    });
    this.db = await indexDB.init();

    if (this.db && this.props.documentID){
      await this.refreshLocalDocuments(this.props.documentID);
    }
    this.timer = setInterval(async ()=>{
      await this.autoSave();
    }, 10 * 60 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  // 本地历史
  autoSave = async () => {
    const document = {
      Content: this.state.editor.getValue(),
      DocumentID: +this.props.documentID,
      BusinessID: +this.props.match.params.BusinessID,
      SaveTime: moment().format()
    };
    await setLocalDocuments(this.db,this.state.localDocuments,document);
    await this.refreshLocalDocuments(this.props.documentID);
  }

  async refreshLocalDocuments(documentID){
    const localDocuments = await getLocalDocuments(this.db,documentID);
    // console.log('refresh local',localDocuments);
    this.setState({
      localDocuments
    });
  }

  // 请求后端：保存、预览、发布、下线
  async checkPage() {
    const BusinessID = this.props.match.params.BusinessID;
    await this.props.actions.getDocCategory(BusinessID);
  }

  saveDocument = async () => {
    const content = this.state.editor.getValue();
    const document = this.props.documentData.find(e => +e.DocumentID === +this.props.documentID);
    const docTitle = document && document.Title || '';
    await this.props.actions.saveDoc(this.props.documentID, docTitle,content,this.state.keyWords,this.props.match.params.BusinessID);
  }

  save = async () => {
    // Modal.confirm({
    //   title: '保存',
    //   content: (<div>确认要<span style={{ color: 'rgb(44,143,255)' }}>保存</span>文档嘛？</div>),
    //   iconType: 'info-circle',
    //   onOk: async () => {
    //     try {
    //       await this.saveDocument();
    //       message.success('保存文档成功！');
    //     } catch (e) {
    //       // message.error('保存文档失败！');
    //     }
    //     await this.checkPage();
    //   }
    // });
    try {
      await this.saveDocument();
      const businessDocPermission = docPermission[`doc_${this.props.match.params.BusinessID}`] || [];
      const canPublish = businessDocPermission.filter(p => p === 'w').length > 0;
      if (!canPublish && this.props.business && this.props.business.Managers && this.props.business.Managers.length > 0) {
        message.success(`保存文档成功且未发布，请联系${this.props.business.Managers.map(manager => manager.EmployeeName).join(',')}审核发布`, 5);
      } else {
        message.success('保存文档成功！');
      }
    } catch (e) {
      // message.error('保存文档失败！');
    }
    await this.checkPage();
  }

  preview = () => {
    const content = this.state.editor.getValue();
    this.setState({
      showPreview: true,
      markDownString: content,
    });
  }

  hidePreview = () => {
    this.setState({
      showPreview: false,
      markDownString: '',
    });
  }

  publish = () => {
    Modal.confirm({
      title: '发布',
      content: (<div>确认要保存并<span style={{ color: 'rgb(44,143,255)' }}>发布</span>文档嘛？</div>),
      iconType: 'info-circle',
      onOk: async () => {
        try {
          await this.saveDocument();
          await this.props.actions.publishDoc(this.props.documentID, this.props.match.params.BusinessID);
          message.success('发布文档成功！');
        } catch (e) {
          // message.error('发布文档失败！');
        }
        await this.checkPage();
        const doc = this.props.documentData.find(e => e.DocumentID == this.props.documentID);
        this.props.onChangeVersion(doc.DocVersion);
      }
    });
  }

  offline = () => {
    Modal.confirm({
      title: '下线',
      content: (<div>确认要<span style={{ color: 'red' }}>下线</span>文档嘛？</div>),
      onOk: async () => {
        try {
          await this.props.actions.offlineDoc(this.props.documentID, this.props.match.params.BusinessID);
          message.success('下线文档成功！');
        } catch (e) {
          // message.error('下线文档失败！');
        }
        await this.checkPage();
      }
    });
  }

  // 编辑器等本身状态管理
  initEditor = (editor) => {
    enhanceEditor(editor,(code)=>{
      if (editor.isMarkdownMode()){
        editor.insertText(code);
      } else {
        // https://github.com/nhnent/tui.editor/blob/51d11e2fa3fecf8b64750fb3f1150d0985c19445/src/js/wysiwygCommands/addLink.js
        // message.warn('所见即所得编辑器暂不支持此功能，请使用Markdown模式来使用此功能');
        const sq = editor.wwEditor.getEditor();
        const link = sq.createElement('A');
        link.innerHTML = code;
        // console.log('code',code,link);
        sq.insertElement(link);
      }
    });
    this.setState({
      editor
    });
    this.props.onEditorInit(editor);
  }

  addImage = (blob, callback) => {
    var reader = new FileReader();
    if (blob.size > uploadMaxSize) {
      message.error(<span>文件大小超出<span>{uploadSizeName}</span>限制</span>);
      return false;
    }
    if (!blob.name.match(/(png|jpeg|jpg)/)) {
      message.error(<span>只支持<span>png/jpeg/jpg</span>文件</span>);
      return false;
    }
    if (!blob.name.match(/^(\w|\.)*$/g)) {
      message.error(<span>文件名只支持<span>英文、数字、下划线</span></span>);
      return false;
    }
    this.setState({ loading: true });
    message.info('文件上传中');
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
          message.warning('文件已存在');
          break;
        case 'TIMEOUT':
          message.error('上传超时');
          break;
        default:
          message.error(`上传失败 ${res.err}`, 10);
        }
      } catch (e) {
        message.error(`上传失败${e && e.statusText ? (' ' + e.statusText) : ''}`, 5);
      }
      this.setState({ loading: false });
    };
    reader.onerror = function () {
      message.error('上传失败');
    };
    reader.onabort = function () {
      message.error('上传失败');
    };
    reader.readAsDataURL(blob);
  }

  onChange = () => {
    this.setState({
      showPrompt: this.props.content !== this.state.editor.getValue()
    });
  }

  checkVersion = (versionID) => {
    if (versionID != null && typeof versionID === 'number') {
      this.props.onChangeVersion(versionID);
    }
    this.setState({
      showVersion: !this.state.showVersion
    });
  }

  toggleLocalDocument = () => {
    this.setState({
      showLocalDocument: !this.state.showLocalDocument
    });
  }

  editLocalDocument = (content) => {
    this.state.editor.setValue(content);
    this.toggleLocalDocument();
  }

  handleKeyWords = (e) => {
    this.setState({
      keyWords: e.target.value
    });
  }

  editTitle = async (title,document) => {
    try {
      const { DocumentID, ParentID, MainPage, Keywords, BusinessID } = document;
      await this.props.actions.updateDoc(DocumentID, ParentID, title, MainPage, Keywords, BusinessID);
      await this.checkPage();
      message.success('重命名成功');
    } catch (e) {
      // message.error('重命名失败！');
    }
  }

  editVisibility = () => {
    this.setState({
      visibleModal: true
    });
  }

  render() {
    const document = this.props.documentData.find(e => +e.DocumentID === +this.props.documentID) || {};
    const docTitle = document && document.Title || '';
    const businessDocPermission = docPermission[`doc_${this.props.match.params.BusinessID}`] || [];
    const canPublish = businessDocPermission.filter(p => p === 'w').length > 0;
    console.log('document.Status,',document.Status);
    const menu = (
      <Menu>
        {
          canPublish &&
          <Menu.Item onClick={this.offline} disabled={document.Status === 'offline'}>
            <span style={{ color: 'red' }} id="offline-doc">下线</span>
          </Menu.Item>
        }
        <Menu.Item onClick={this.preview}>
          <span id="view-doc">预览</span>
        </Menu.Item>
        <Menu.Item onClick={this.checkVersion}>
          <span id="version-doc">版本管理</span>
        </Menu.Item>
        <Menu.Item onClick={this.toggleLocalDocument}>
          <span id="history-doc">本地历史</span>
        </Menu.Item>
        {
          canPublish &&
          <Menu.Item onClick={this.editVisibility}>
            <span id="visibility-doc">可见性</span>
          </Menu.Item>
        }
      </Menu>
    );

    return (
      <div className={style.editor}>
        {this.props.documentID && document.DocumentID ? null : <div className={style.mask}></div>}
        <div className={style.operator}>
          <Row>
            <Col span={10}>
              <div className={style.desc}>
                {document ?
                  <div>
                    <h2>
                      文档标题：<EditableTitle title={document.Title} onEdit={title => this.editTitle(title,document)}/>
                    </h2>
                    <span>（版本：{document.DocVersion}，上次保存时间：{moment.unix(document.UpdateTime).format('YYYY-MM-DD HH:mm:ss')}）</span>
                  </div>
                  : '未选择文档'
                }
              </div>
            </Col>
            <Col span={14}>
              <div className={style['button-group']}>
                <Tooltip title="保存当前更改，但不发布到线上">
                  <Button type="primary" onClick={this.save}>保存</Button>
                </Tooltip>
                {
                  canPublish &&
                  <Tooltip title="保存当前更改，并发布到线上">
                    <Button type="primary" onClick={this.publish}>发布</Button>
                  </Tooltip>
                }
                <Dropdown overlay={menu} placement="bottomLeft">
                  <Button icon="ellipsis" className={style['more']}></Button>
                </Dropdown>
              </div>
            </Col>
          </Row>
        </div>
        <MarkdownEditor content={this.props.content} onEditorInit={this.initEditor} onKeySave={this.save} options={
          {
            events: {
              change: this.onChange
            },
            hooks: {
              addImageBlobHook: this.addImage
            }
          }}
        />
        <Divider/>
        <Card title={null}>
          <Form.Item label="搜索关键词" {...itemLayout}>
            <Input value={this.state.keyWords} maxLength={64} onChange={this.handleKeyWords} placeholder="请输入本文中的关键词，用于用户官网搜索匹配使用，以英文逗号分隔（选填）"/>
          </Form.Item>
        </Card>
        {this.state.loading && <div className={style.loading}><Spin/></div>}
        {this.state.showVersion ? <Version
          visible={this.state.showVersion}
          docTitle={docTitle}
          {...this.props}
          canPublish={canPublish}
          checkVersion={this.checkVersion}/> : null}
        <PreviewForm docTitle={docTitle} hideModal={this.hidePreview} visible={this.state.showPreview}
          markDownString={this.state.markDownString}/>
        <Prompt
          when={this.state.showPrompt}
          message={() => {
            return '您当前文档有更改尚未进行保存，确认要离开此页面吗？';
          }}
        />
        <LocalDocument
          visible={this.state.showLocalDocument}
          onClose={this.toggleLocalDocument}
          document={this.state.localDocuments}
          onEdit={this.editLocalDocument}
        />
        <Modal
          title="单篇文档可见性"
          visible={this.state.visibleModal}
          onCancel={()=> {
            this.setState({
              Scope: document.Scope,
              visibleModal: false
            });
          }}
          onOk={async () => {
            const { DocumentID, ParentID, Keywords, BusinessID } = document;
            await this.props.actions.updateDoc(DocumentID, ParentID, undefined, undefined, Keywords, BusinessID, this.state.Scope).catch(e => { console.log(e); message.error('修改失败'); });
            message.success('修改成功！');
            this.setState({
              visibleModal: false
            });
            await this.checkPage();
          }}
        >
          <div>
            <br />
            设置：
            <RadioGroup value={this.state.Scope} onChange={e => {
              this.setState({
                Scope: e.target.value
              });
            }}
            >
              <Radio value={'public'}>任何人都可见</Radio>
              <Radio value={'private'}>仅头条内网可见</Radio>
            </RadioGroup>
            <br /><br /><br />
            <Alert
              message='友情提示'
              description='仅头条内网可见的含义是，只能通过网站vcloud.bytedance.net入口访问，适用于内部客户的文档或者不适合对外公开的文档'
              type='warning'
            />
          </div>
        </Modal>
      </div>
    );
  }
}

Editor.propTypes = {
  content: PropTypes.string,
  keyWords: PropTypes.string,
  documentID: PropTypes.any,
  documentData: PropTypes.array,
  onEditorInit: PropTypes.func,
  onChangeVersion: PropTypes.func
};

export default Editor;