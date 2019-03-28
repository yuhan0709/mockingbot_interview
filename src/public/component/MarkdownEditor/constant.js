import anchor from 'markdown-it-anchor';
import TuiEditor from '../../../../lib/tui-editor.min';
import containersPlugin from '../MarkdownPreview/containers';
import replacer from '../MarkdownPreview/replacer';
import { anchorConfig } from '../MarkdownPreview/util';
import highlightLines from '../MarkdownPreview/highlight-lines';
import '../../../../lib/tui-editor.min.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/display/fullscreen.css';
import './fullscreen';
import 'highlight.js/styles/github.css';

export const defaultOptions = {
  initialEditType: 'markdown',
  previewStyle: 'vertical',
  height: '100%',
  language: 'zh_CN',
  exts: ['react'],
  toolbarItems: [
    'heading',
    'bold',
    'italic',
    'strike',
    'divider',
    'hr',
    'quote',
    'divider',
    'ul',
    'ol',
    // 'task',
    'indent',
    'outdent',
    'divider',
    'table',
    'image',
    'link',
    'divider',
    'code',
    'codeblock',
  ],
  useCommandShortcut: false
};

export const defaultReactCode = `
\`\`\`mixin-react
return (
   <div>
       默认
   </div>
);
\`\`\`
`;

function genExampleCode (code) {
  return `
\`\`\` mixin-react
${code}
\`\`\`
`;
}
export const codes = [
  {
    title: '默认',
    code: defaultReactCode
  },
  {
    title: '按钮弹窗',
    code: genExampleCode(`const { Button,Modal } = Antd
const info = () => {
  Modal.info({
    title: '视频云文档编辑器，你值得拥有',
    content: (
      <div>
        <p>这是一个可以执行代码的编辑器~</p>
        <p>但千万不要干坏事噢~</p>
      </div>
    ),
    onOk() {},
  });
}
return (
   <div>
       <Button type="primary" onClick={info}>点我！</Button>
   </div>
);`)
  },
  {
    title: '进度',
    code: genExampleCode(`const Progress = Antd.Progress
return (
   <div>
      <Progress percent={70} status="exception" />
      <Progress type="circle" percent={60} />
   </div>
);`)
  },
  {
    title: '时间轴',
    code: genExampleCode(`const Timeline = Antd.Timeline
const noteStyle = {color:'grey',margin:0}
return (
   <div>
      <Timeline>
        <Timeline.Item>视频云官网上线 2018-06-01</Timeline.Item>
        <Timeline.Item>视频云官网后台上线 2018-06-20</Timeline.Item>
        <Timeline.Item>视频云控制台一期上线 2018-09-01<p style={noteStyle}>note</p></Timeline.Item>
        <Timeline.Item color="red">未完待续</Timeline.Item>
      </Timeline>
   </div>
);`) },
  {
    title: '横向轴',
    code: genExampleCode(`const { Steps, Popover } = Antd;

const Step = Steps.Step;
const contents = ['1号内容','2号内容','3号内容','4号内容']

const customDot = (dot, { index }) => (
  <Popover content={contents[index]}>
    {dot}
  </Popover>
);
return (
   <div>
       <Steps current={3} progressDot={customDot}>
        <Step title="2018-8-7" />
        <Step title="2018-8-8" />
        <Step title="2018-8-9" />
        <Step title="2018-8-10" />
      </Steps>
   </div>
);`)
  },
  {
    title: '星级评分',
    code: genExampleCode(`const { Rate } = Antd
return (
   <div>
      <Rate style={{padding:0}} disabled defaultValue={4} /> 
   </div>
);`)
  },
  { title: '卡片',code: genExampleCode(`const { Card } = Antd
const { Meta } = Card
return (
   <div>
    <Card
    hoverable
    style={{ width: 240 }}
    cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
    >
    <Meta
      title="卡片标题"
      description="卡片备注"
    />
  </Card>
   </div>
);`) },
  { title: '折叠面板',code: genExampleCode(`const { Collapse } = Antd;

const Panel = Collapse.Panel;

return (
   <div>
      <Collapse bordered={false} defaultActiveKey={['1']}>
        <Panel header="1号面板" key="1">
          嘿嘿嘿
        </Panel>
        <Panel header="2号面板" key="2">
          嘻嘻嘻
        </Panel>
        <Panel header="3号面板" key="3">
          哈哈哈
        </Panel>
      </Collapse>
   </div>
);`) },
  {
    title: 'Tab',
    code: genExampleCode(`const { Tabs } = Antd;

const TabPane = Tabs.TabPane;
return (
   <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Tab 1" key="1">1号内容</TabPane>
        <TabPane tab="Tab 2" key="2">2号内容</TabPane>
        <TabPane tab="Tab 3" key="3">3号内容</TabPane>
       </Tabs>  
   </div>
);`) },
  {
    title: '提示',
    code: genExampleCode(`const { Alert } = Antd
return (
   <div>
    <Alert
      message="成功"
      description="success"
      type="success"
      showIcon
    />
    <Alert
      message="信息"
      description="info"
      type="info"
      showIcon
    />
    <Alert
      message="警告"
      description="warning"
      type="warning"
      showIcon
    />
    <Alert
      message="error"
      description="error"
      type="error"
      showIcon
    />
   </div>
);`) },
  {
    title: '分割线',
    code: genExampleCode(`const { Divider } = Antd
return (
   <div>
       <Divider>华丽的分割线</Divider>
   </div>
);`)
  },
  {
    title: '栅格布局',
    code: genExampleCode(`const { Row,Col } = Antd
return (
   <div>
        <Row>
          <Col span={12}>左边12列</Col>
          <Col span={12}>右边12列~~~~</Col>
        </Row>
   </div>
);`)
  },
];

// 解决编辑器写代码时滚动 bug
TuiEditor.defineExtension('react', function () {
  TuiEditor.codeBlockManager.setReplacer('mixin-react', (code) => {
    const preview = document.querySelector('.te-preview');
    const scrollTop = preview.scrollTop;
    setTimeout(() => {
      preview.scrollTop = scrollTop;
    }, 20);
    return replacer(code, 'mixin-react');
  });
});

// md-it 插件
TuiEditor.markdownitHighlight
  .use(anchor, anchorConfig)
  .use(containersPlugin)
  .use(highlightLines);
// .use(lineNumbersPlugin);

export default TuiEditor;