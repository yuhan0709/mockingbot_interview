import React, { Component } from 'react';
import { Modal, Table,message,Badge } from 'antd';
import TableControlButton from '@component/TableControlButton';
import PreviewForm from './preview';
import style from './style.less';
import moment from 'moment';
import Apis from '../../../util/request';

class Version extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPreview: false,
      markDownString: '',
    };
  }

  componentDidMount() {
    this.getVersionList();
  }

  async checkPage() {
    const BusinessID = this.props.match.params.BusinessID;
    await this.props.actions.getDocCategory(BusinessID);
  }

  getVersionList = async () => {
    await this.props.actions.getDocVersionList(this.props.documentID, this.props.match.params.BusinessID);
  }

  onChange = async (pageNumber) => {
    const limit = this.props.versionList.Limit;
    const offset = (pageNumber - 1) * limit;
    await this.props.actions.getDocVersionList(this.props.documentID, this.props.match.params.BusinessID, limit, offset);
  }

  edit = async (_, data) => {
    try {
      await this.props.actions.getDocForVersion(data.DocumentID, data.VersionID, this.props.match.params.BusinessID);
      this.props.checkVersion();
    } catch (e) {
      // message.error('获取此版本文档失败！');
    }
  }

  publish = async (_,data) => {
    try {
      await this.props.actions.publishDocForVersion(data.DocumentID, data.VersionID, this.props.match.params.BusinessID);
      this.props.checkVersion(data.VersionID);
      message.success('发布此版本文档成功！');
    } catch (e) {
      // message.error('发布此版本文档失败！');
    }
  }

  offline = async (_,data) => {
    Modal.confirm({
      title: '下线',
      content: (<div>确认要<span style={{ color: 'red' }}>下线</span>此版本文档嘛？</div>),
      iconType: 'info-circle',
      onOk: async () => {
        try {
          await this.props.actions.offlineDoc(data.DocumentID, this.props.match.params.BusinessID);
          this.props.checkVersion();
          message.success('下线此版本文档成功！');
        } catch (e) {
          // message.error('下线此版本文档失败！');
        }
        await this.checkPage();
      }
    });
  }

  preview = async (_, data) => {
    const { Content } = await Apis.GetBusinessDocumentVersion({
      DocumentID: data.DocumentID,
      VersionID: data.VersionID,
      BusinessID: this.props.match.params.BusinessID
    });
    this.setState({
      showPreview: true,
      markDownString: Content,
    });
  }

  hidePreview = () => {
    this.setState({
      showPreview: false,
      markDownString: '',
    });
  }

  render() {
    const { canPublish } = this.props;
    const columns = [{
      title: '版本号',
      dataIndex: 'VersionID',
      key: 'VersionID',
      render: (name, rowData) => {
        const isCurVersion = rowData.VersionID === this.props.documentVersion && rowData.Status === 'online';
        { return isCurVersion ? <Badge title="当前线上发布的版本" dot style={{ backgroundColor: '#52c41a',top: '4px',left: '-12px' }}>
          {name}
        </Badge> : name; }
      }
    },
    {
      title: '首发时间',
      dataIndex: 'CreateTime',
      key: 'CreateTime',
      render: (time) => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '创建人',
      dataIndex: 'Creator',
      key: 'Creator',
      render: (person) => person !== 'undefined' ? person : '-'
    },
    {
      title: '发布时间',
      dataIndex: 'PublishTime',
      key: 'PublishTime',
      render: (time) => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '发布人',
      dataIndex: 'Publisher',
      key: 'Publisher',
      render: (person) => person !== 'undefined' ? person : '-'
    },{
      title: '操作',
      key: 'Op',
      render: (_, rowData) => {
        const buttons = [<TableControlButton className={style.control} data={rowData} key="preview" onClick={this.preview}>预览</TableControlButton>,
          <TableControlButton className={style.control} data={rowData} key="edit" onClick={this.edit}>编辑</TableControlButton>];
        const button = rowData.VersionID !== this.props.documentVersion || rowData.Status === 'offline' ?
          <TableControlButton className={style.control} data={rowData} onClick={this.publish} key="publish">发布</TableControlButton> : <TableControlButton className={style.controlRed} data={rowData} onClick={this.offline} key="offline">下线</TableControlButton>;
        if (canPublish) buttons.push(button);
        return buttons;
      }
    }];

    const pagination = {
      showQuickJumper: true,
      current: this.props.versionList.Offset,
      pageSize: this.props.versionList.Limit,
      total: this.props.versionList.Total,
      onChange: this.onChange
    };
    return (
      <div>
        <Modal
          title={<div>版本管理（当前版本：{this.props.documentVersion}）</div>}
          visible={this.props.visible}
          onCancel={() => this.props.checkVersion()}
          footer={null}
          width="70%"
        >
          <Table
            rowKey="VersionID"
            dataSource={this.props.versionList.List}
            columns={columns}
            pagination={pagination}/>
        </Modal>
        <PreviewForm docTitle={this.props.docTitle} hideModal={this.hidePreview} visible={this.state.showPreview} markDownString={this.state.markDownString} />
      </div>
    );
  }
}

export default Version;