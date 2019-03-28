import React, { PureComponent } from 'react';
import { Tree, Modal, Button, message, Row, Col } from 'antd';
import TreeNodeTitle from '../../../component/TreeNodeTitle/index';
import style from './style.less';
import { removeDouble, loop, GetUrlParms } from './util';
import SaveModal from './saveModal';

const TreeNode = Tree.TreeNode;
const permission = window.INIT_CONFIG.permission || {};
const docPermission = permission.doc || {};

class Directory extends PureComponent {
  selectedNode = {}

  constructor(props) {
    super(props);
    this.state = {
      gData: [],
      checkedKeys: [],
      expandedKeys: [],
      selectedKeys: [],
      newNode: {},
    };

    window.onbeforeunload = () => {
      return '你确定要离开吗';
    };
  }

  async componentDidMount() {
    await this.checkPage();
    const defaultSelectedKey = this.getDefaultSelectedKey();
    const defaultExpandedKeys = this.getDefaultExpandedKeys(defaultSelectedKey);

    this.setState({
      gData: this.props.documentCategory,
      selectedKeys: [defaultSelectedKey + ''],
      expandedKeys: defaultExpandedKeys.map(e => e + '')
    });
    defaultSelectedKey && this.props.onSelect(defaultSelectedKey);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.documentCategory !== nextProps.documentCategory) {
      this.setState({
        gData: nextProps.documentCategory
      });
    }
  }

  componentWillUnmount() {
    window.onbeforeunload = null;
  }

  async checkPage() {
    const BusinessID = this.props.match.params.BusinessID;
    await this.props.actions.getDocCategory(BusinessID);
    // console.log(this.props.business);

    // 如果只剩一个节点，自动选中，如果一个都不剩，自动屏蔽编辑区
    const data = this.props.documentData;
    if (data.length === 1) {
      this.setState({
        selectedKeys: [data[0].DocumentID + ''],
      });
      this.props.onSelect(data[0].DocumentID);
    } else if (data.length === 0) {
      this.props.onSelect(null);
    }
  }

  getDefaultSelectedKey() {
    // 若没有传参，默认选择第一个
    const { DocumentId } = GetUrlParms();
    if (DocumentId) {
      return DocumentId;
    }
    const rst = [];
    const DFS = (tree) => {
      if (!tree) return;
      if (tree.children != null) {
        DFS(tree.children[0]);
      }
      rst.push(tree);
    };
    DFS(this.props.documentCategory[0]);

    const node = rst[0] || {};
    return node.DocumentID;
  }

  getDefaultExpandedKeys(key) {
    const rst = [];
    const getAllParentIDs = (key) => {
      const parent = this.props.documentData.find(e => +e.DocumentID === +key) || {};
      const pid = parent.ParentID;
      if (pid != null) {
        rst.push(pid);
        getAllParentIDs(pid);
      }
    };

    getAllParentIDs(key);
    return rst;
  }

  // 用户操作
  publish = () => {
    const BusinessID = this.props.match.params.BusinessID;
    const DocumentIDs = this.state.checkedKeys;
    if (DocumentIDs.length === 0) {
      message.warn('请先选择文档！');
      return;
    }
    const DocumentTitles = this.props.documentData
      .filter(e => DocumentIDs.includes(e.DocumentID + '') && !e.IsDir )
      .map(e => e.Title);

    Modal.confirm({
      title: '发布',
      content: (<div>确认要<span style={{ color: 'rgb(44,143,255)' }}>发布</span>以下文档嘛？<br/>
        {DocumentTitles.map(e => <p key={e} style={{ marginBottom: 0 }}>{e}</p>)}</div>
      ),
      iconType: 'info-circle',
      onOk: async () => {
        try {
          await this.props.actions.publishMultiDoc(DocumentIDs, BusinessID);
          this.setState({
            checkedKeys: []
          });
          message.success('批量发布文档成功！');
        } catch (e) {
          // message.error('批量发布文档失败！');
        }

        await this.checkPage();
        const doc = this.props.documentData.find(e => e.DocumentID == this.props.documentID) || {};
        this.props.onChangeVersion(doc.DocVersion);
      }
    });
  }
  offline = () => {
    const BusinessID = this.props.match.params.BusinessID;
    const DocumentIDs = this.state.checkedKeys;
    if (DocumentIDs.length === 0) {
      message.warn('请先选择文档！');
      return;
    }
    const DocumentTitles = this.props.documentData
      .filter(e => DocumentIDs.includes(e.DocumentID + '') && !e.IsDir)
      .map(e => e.Title);

    Modal.confirm({
      title: '下线',
      content: (<div>确认要<span style={{ color: 'red' }}>下线</span>以下文档嘛？
        {DocumentTitles.map(e => <p key={e} style={{ marginBottom: 0 }}>{e}</p>)}</div>),
      onOk: async () => {
        try {
          await this.props.actions.offlineMultiDoc(DocumentIDs, BusinessID);
          message.success('批量下线文档成功！');
          this.setState({
            checkedKeys: []
          });
        } catch (e) {
          // message.error('批量下线文档失败！');
        }
        await this.checkPage();
      }
    });
  }
  save = async () => {
    const content = this.props.editor.getValue();
    try {
      const document = this.props.documentData.find(e => +e.DocumentID === +this.props.documentID);
      const docTitle = document && document.Title || '';
      await this.props.actions.saveDoc(this.props.documentID, docTitle, content, document.Keywords, this.props.match.params.BusinessID);
      await this.checkPage();
      message.success('保存文档成功！');
      this.triggerSelect();
    } catch (e) {
      // message.error('保存文档失败！');
      // console.log(e);
      this.setState({
        showModal: false
      });

      Modal.confirm({
        className: style['network-error-modal'],
        content: '网络繁忙，若继续操作，您当前的更改将会消失，是否继续操作？',
        iconType: 'close-circle',
        onOk: this.triggerSelect,
        onCancel() {
          console.log('Cancel');
        },
        okText: '确认',
        cancelText: '取消'
      });
    }
  }

  // 树的方法
  triggerSelect = () => {
    const { selectedKeys, selected } = this.selectedNode;
    this.setState({
      selectedKeys: selectedKeys,
      showModal: false
      // expandedKeys: [].concat(this.state.expandedKeys,expandedKeys)
    });

    if (selected) {
      this.props.onSelect(selectedKeys);
    }
  };
  selectTree = (selectedKeys, { selected, selectedNodes }) => {
    // 选择父节点要重新设置 select 和 expend 的 key ？不需要做了？selectedNodes
    // const getExpandedKeys = (node,rst = []) => {
    //   // debugger
    //   rst.push(node.key);
    //   if (node.props && node.props.children){
    //     node = node.props.children[0];
    //     getExpandedKeys(node,rst);
    //   }
    //   return rst;
    // };
    // const expandedKeys = getExpandedKeys(selectedNodes[0]);
    // selectedKeys = [expandedKeys[expandedKeys.length - 1]];

    const showModal = this.props.editor.getValue() !== this.props.content;
    this.selectedNode = {
      selectedKeys,
      selected,
      selectedTitle: selectedNodes[0].props.title.props.title,
      preTitle: (this.props.documentData.find(e => +e.DocumentID === +this.props.documentID) || {}).Title
    };

    if (showModal && this.selectedNode.preTitle != null) {
      this.setState({
        showModal
      });
    } else {
      this.triggerSelect();
    }
  }
  checkTree = (checkedKeys) => {
    this.setState({
      checkedKeys: checkedKeys
    });
  }
  expand = (expandedKeys) => {
    // console.log(expandedKeys,expanded,node);
    this.setState({
      expandedKeys: expandedKeys
    });
  }

  // 拖拽可行
  onDragEnter = (info) => {
    console.log('拖拽可行', info);
    // expandedKeys 需要受控时设置
    this.setState({
      expandedKeys: info.expandedKeys,
    });
  }
  // 拖拽结束
  onDrop = async (info) => {
    const BusinessID = this.props.match.params.BusinessID;
    // console.log('拖拽结束', node, dragNode);
    // 在此做顺序调整逻辑
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    // const dragNodesKeys = info.dragNodesKeys;
    const data = [...this.state.gData];
    let dragObj;
    let dropObj = null;
    let newArr = [];
    let newNodes = [];
    // 仅调整顺序
    if (info.dropToGap) {
      // 取出拖的数据
      loop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
      });
      let i;
      loop(data, dropKey, (item, index, arr) => {
        newArr = arr;
        i = index;
      });
      // 插入放的数据
      if (dropPosition === -1) {
        newArr.splice(i, 0, dragObj);
      } else {
        newArr.splice(i + 1, 0, dragObj);
      }

      // 更新
      this.setState({
        gData: data,
      });
      const newIndexs = newArr.map(e => e.Index).sort((a, b) => a - b);
      const newDocIDs = newArr.map(e => e.DocumentID);
      if (newDocIDs.some(e => typeof e === 'string')) {
        message.warn('文档新增中，请稍后再调整顺序');
        return;
      }

      // Todo:优化算法，去除 Index 和 ParentID 前后都没有变化的节点：拿newArr中的节点和this.props.documentData中的节点去比
      const ParentID = this.props.documentData.find(e => e.DocumentID === +dropKey).ParentID;
      newNodes = newDocIDs.map((e, i) => {
        return {
          DocumentID: e,
          Index: newIndexs[i],
          ParentID,
        };
      });
    }
    else { // 移入目录
      loop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
      });
      loop(data, dropKey, (item) => {
        dropObj = item;
        if (!dropObj.IsDir){
          return;
        }
        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.push(dragObj);
      });
      console.log('dropObj',dropObj);
      if (!dropObj.IsDir){
        message.error(`${dragObj.IsDir ? '目录' : '文档'}不能放入文档中`);
        await this.checkPage();
        return;
      }
      newNodes = [{
        DocumentID: dragObj.DocumentID,
        Index: dragObj.Index,
        ParentID: dropObj.DocumentID
      }];
    }
    try {
      await this.props.actions.adjustDoc(newNodes, BusinessID);
      message.success('调整成功！');
    } catch (e) {
      // message.error('调整失败！');
    }
    await this.checkPage();
  }

  // 增删改节点
  editNode = async (item, val, fromAdd) => {
    if (fromAdd) {
      const { BusinessID, ParentID, MainPage = 0, KeyWords = '',IsDir } = this.state.newNode;
      try {
        await this.props.actions.addDoc({ BusinessID, ParentID, Title: val, MainPage, KeyWords,IsDir: +IsDir });
        await this.checkPage();
        message.success('新增成功！');
      } catch (e) {
        // message.error('新增失败！');
        await this.checkPage();
      }
    } else {
      const { BusinessID, DocumentID, ParentID, MainPage = 0, KeyWords = '', Title } = item;
      if (Title === val) {
        return;
      }
      try {
        await this.props.actions.updateDoc(DocumentID, ParentID, val, MainPage, KeyWords, BusinessID);
        await this.checkPage();
        message.success('重命名成功');
      } catch (e) {
        // message.error('重命名失败！');
        await this.checkPage();
      }
    }
  }

  addNodeChild = (key,type) => {
    // console.log(`获取这个${key}节点信息，然后推入一个子节点。`);
    const data = [...this.state.gData];
    let newNode = {};
    let newKey = new Date().getTime() + '';
    loop(data, key, (item) => {
      item.children = item.children || [];
      newNode = {
        Title: '未命名',
        BusinessID: item.BusinessID,
        DocumentID: newKey,
        ParentID: key,
        children: null,
        defaultEdit: true,
        fromAdd: true,
        IsDir: type === 'directory'
      };
      // 示例是添加到尾部，如果用 splice 可以是随意位置
      item.children.push(newNode);
    });

    this.setState({
      gData: data,
      expandedKeys: removeDouble(this.state.expandedKeys, key, newKey).map(e => String(e)),
      newNode
    });
    // console.log(this.state.expandedKeys);
  }

  addNode = (type) => {
    const data = [...this.state.gData];
    let newKey = new Date().getTime() + '';
    let newNode = {
      Title: '未命名',
      BusinessID: this.props.match.params.BusinessID,
      DocumentID: newKey,
      children: null,
      defaultEdit: true,
      fromAdd: true,
      IsDir: type === 'directory'
    };
    data.push(newNode);
    this.setState({
      gData: data,
      newNode,
    });
  }

  deleteNode = async (key) => {
    // 如果删除的节点有子节点，前端拦截
    if (this.props.documentData.find(e => +e.ParentID === +key)) {
      message.error('删除失败！此节点还有子节点');
      return;
    }

    const BusinessID = this.props.match.params.BusinessID;
    try {
      await this.props.actions.deleteDoc(key, BusinessID);
      if (+key === +this.state.selectedKeys[0]) {
        this.props.onSelect(null);
      }
      await this.checkPage();
      message.success('删除成功！');
    } catch (e) {
      // message.error('删除失败！');
    }
    await this.checkPage();
  }

  render() {
    const businessDocPermission = docPermission[`doc_${this.props.match.params.BusinessID}`] || [];
    const canPublish = businessDocPermission.filter(p => p === 'w').length > 0;
    const loop = data => data.map((item) => {
      if (item.children && item.children.length) {
        return (
          <TreeNode key={item.DocumentID}
            title={<TreeNodeTitle
              visible={item.Scope === 'public'}
              className={style['node-btns']}
              title={item.Title}
              status={item.IsModified ? 'unpublish' : item.Status}
              defaultEdit={item.defaultEdit}
              fromAdd={item.fromAdd}
              isDirectory={!!item.IsDir}
              onPlus={(e, type) => this.addNodeChild(item.DocumentID,type)}
              onEdit={(val, fromAdd) => this.editNode(item, val, fromAdd)}
              onDelete={(e) => this.deleteNode(item.DocumentID, e)}
            />}
          >
            {loop(item.children)}
          </TreeNode>
        );
      }

      return (
        <TreeNode key={item.DocumentID}
          title={<TreeNodeTitle
            className={style['node-btns']}
            visible={item.Scope === 'public'}
            title={item.Title}
            status={item.IsModified ? 'unpublish' : item.Status}
            defaultEdit={item.defaultEdit}
            fromAdd={item.fromAdd}
            isDirectory={!!item.IsDir}
            onPlus={(e,type) => this.addNodeChild(item.DocumentID, type)}
            onEdit={(val, fromAdd) => this.editNode(item, val, fromAdd)}
            onDelete={(e) => this.deleteNode(item.DocumentID, e)}
          />}
        />
      );
    });

    return (
      <div className={style.directory}>
        <div className={style.batch}>
          <Row>
            <Col span={24}>
              <span className={style.name}>
                {this.props.business.Name}
              </span>
            </Col>
            <Col span={24} className={style['publsh-row']}>

              {
                canPublish &&
              [<Button key="publish" type="primary" onClick={this.publish}>批量发布</Button>,
                <Button key="offline" type="danger" onClick={this.offline}>批量下线</Button>]
              }
            </Col>

          </Row>
        </div>

        <Button type="primary" icon="folder-add" className={style['add-title']} onClick={(e) => this.addNode('directory', e)}>新建目录</Button>
        <Button type="primary" icon="file-add" className={style['add-title']} onClick={(e) => this.addNode('file', e)}>新建文档</Button>
        <section>
          <Tree
            className="draggable-tree"
            draggable
            checkable
            defaultExpandAll
            selectedKeys={this.state.selectedKeys}
            expandedKeys={this.state.expandedKeys}
            checkedKeys={this.state.checkedKeys}
            onDragEnter={this.onDragEnter}
            onDrop={this.onDrop}
            onExpand={this.expand}
            onCheck={this.checkTree}
            onSelect={this.selectTree}
          >
            {loop(this.state.gData)}
          </Tree>
        </section>

        <SaveModal
          showModal={this.state.showModal}
          title={this.selectedNode.preTitle}
          onUnSave={this.triggerSelect}
          onCancel={() => {
            this.setState({ showModal: false });
          }}
          onSave={this.save}
        />
      </div>
    );
  }
}

export default Directory;