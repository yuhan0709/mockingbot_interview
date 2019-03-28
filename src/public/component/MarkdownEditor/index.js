import React, { PureComponent } from 'react';
import { message } from 'antd';
import PropTypes from 'prop-types';
import TuiEditor, { defaultReactCode, defaultOptions } from './constant';
import $ from 'jquery';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-free/css/v4-shims.min.css';
import style from '../MarkdownPreview/index.less';
import ComponentModal from './componentModal';

export default class MarkdownEditor extends PureComponent {
  editor = null
  editorRef = null

  state = {
    showComponentModal: false
  }

  static propTypes = {
    options: PropTypes.object,
    containerStyle: PropTypes.object,
    content: PropTypes.string,
    onEditorInit: PropTypes.func,
    onKeySave: PropTypes.func
  };

  static defaultProps = {
    options: {},
    containerStyle: {},
    content: '',
    onEditorInit: () => {
    },
    onKeySave: () => {
    }
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.editor && this.props.content !== nextProps.content) {
      const needUpdate = this.editor.getValue() !== nextProps.content;
      needUpdate && this.editor.setValue(nextProps.content);
      // this.editor.scrollTop(1);
    }
  }

  getEditor = (ref) => {
    if (ref) {
      this.editorRef = ref;
      const { options, content } = this.props;
      const editor = new TuiEditor({
        el: ref,
        ...defaultOptions,
        ...options
      });

      this.enhanceEditor(editor);

      editor.setValue(content);
      this.editor = editor;
      this.props.onEditorInit(this.editor);
    }
  }

  enhanceEditor = (editor) => {
    const cm = editor.mdEditor.cm;
    // 快捷键：保存、全屏退出
    cm.setOption('extraKeys', {
      'Ctrl-S': () => {
        console.log('windows key save');
        this.props.onKeySave();
      },
      'Cmd-S': () => {
        console.log('mac key save');
        this.props.onKeySave();
      }
    });
    // console.log('editor.wwEditor',editor.wwEditor);
    editor.wwEditor.addKeyEventHandler(['CTRL+S', 'META+S'], (e,...args) => {
      e.stopPropagation();
      e.preventDefault();
      console.log('www key save',args);
      this.props.onKeySave();
    });

    // 按钮：组件、全屏
    const toolbar = editor.getUI().getToolbar();

    editor.eventManager.addEventType('addReactComponent');
    editor.eventManager.listen('addReactComponent', () => {
      this.setState({
        showComponentModal: true
      });
    });

    toolbar.addButton({
      name: 'add-component',
      event: 'addReactComponent',
      tooltip: '前端组件',
      $el: $('<div class="our-button-class"><i class="fas fa-file-code"></i></div>')
    });

    // Info:良好的全屏体验需要修改 codemirror/addon/display/fullscreen 代码，甚至让两个编辑器通用
    editor.eventManager.addEventType('fullscreen');
    editor.eventManager.listen('fullscreen', () => {
      const enableFullScreen = cm.getOption('fullScreen');
      cm.setOption('fullScreen', !enableFullScreen);
      editor.focus();
      !enableFullScreen && message.info('按ESC键退出全屏编辑模式');
    });
    toolbar.addButton({
      name: 'fullscreen',
      event: 'fullscreen',
      tooltip: '全屏',
      $el: $('<div class="our-button-class"><i class="fas fa-compress"></i></div>')
    });
  }

  insertComponentCode = (code = defaultReactCode) => {
    if (this.editor.isMarkdownMode()){
      this.editor.insertText(code);
    } else {
      message.warn('所见即所得编辑器暂不支持此功能，请使用Markdown模式来使用此功能');
    }
    this.setState({ showComponentModal: false });
  }

  handleKeyUp = (event) => {
    const keyName = event.key;
    if (keyName.toUpperCase() === 'ESCAPE'){
      console.log('keypress event\n\n' + 'key: ' + keyName);
      const cm = this.editor.mdEditor.cm;
      cm.setOption('fullScreen', false);
    }
  }

  render() {
    return (
      <div ref={this.getEditor} className={style.markdownPreview + ' markdown-body markdown-editor-container'} style={this.props.containerStyle} onKeyUp={this.handleKeyUp}>
        <ComponentModal
          showModal={this.state.showComponentModal}
          onCancel={() => {
            this.setState({ showComponentModal: false });
          }}
          onSave={this.insertComponentCode}
        />
      </div>
    );
  }
}