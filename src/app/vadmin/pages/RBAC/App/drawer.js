import React, { Component } from 'react';
import { Drawer, Input, Row, Col, Button, Table, message } from 'antd';
import style from './index.less';
import { colFormat } from '@util/index';
import { getUserId } from '../../../../../server/api/vadmin/lark';
import Apis from '../../../util/request';
import TableControlButton from '@component/TableControlButton';

class AddDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      email: '',
      searchList: [],
      showList: []
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible) {
      this.setState({
        visible: true,
        email: '',
        showList: []
      });
      this.getData(nextProps);
    }
  }

    getData = async (props = this.props) => {
      const showList = (await Apis.ListAppManager({
        Limit: 999,
        Email: props.email,
        AppId: props.appId
      })).List;
      this.setState({
        showList
      });
    }

    search = async () => {
      const email = this.state.email;
      console.log('search',email);
      const res = await getUserId(email);
      if (res.ok) {
        this.setState({
          searchList: [{
            Name: res.name,
            EmployeeEmail: email
          }]
        });
      } else {
        message.error('查无此人');
      }
    }

    onClose = () => {
      this.setState({
        visible: false
      });
    }

    searchColumns = [
      colFormat('用户名', 'Name'),
      colFormat('邮箱', 'EmployeeEmail'),
      colFormat('操作', 'chosen', (_, rowData) => {
        return (
          <TableControlButton
            data={rowData}
            key="add"
            onClick={async () => {
              await Apis.AddAppManager({
                Email: this.props.email,
                AppId: this.props.appId,
                EmployeeEmail: rowData.EmployeeEmail,
                EmployeeName: rowData.Name,
              });
              await this.getData();
              message.success('添加成功');
            }}
          >
                    添加
          </TableControlButton>

        ); })
    ]

    showColumns = [
      colFormat('用户名', 'EmployeeName'),
      colFormat('邮箱', 'EmployeeEmail'),
      colFormat('操作', 'chosen', (_, rowData) => {
        return (
          <TableControlButton
            data={rowData}
            key="delete"
            onClick={async () => {
              await Apis.RemoveAppManager({
                Email: this.props.email,
                AppId: this.props.appId,
                EmployeeEmail: rowData.EmployeeEmail
              });
              await this.getData();
              message.success('移除成功');
            }}
          >
                    移除
          </TableControlButton>

        ); })
    ]

    render() {

      return (
        <Drawer
          title={'管理员'}
          width={620}
          closable={false}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Row>
            <Col span={4} className={style.top}>添加用户：</Col>
            <Col span={18}><Input
              placeholder="请输入用户邮箱"
              value={this.state.email}
              onChange={e => {
                console.log('change',this.state);
                this.setState({
                  email: e.target.value
                });
              }}/>
            </Col>
            <Col span={2}>
                    &nbsp;&nbsp;
              <Button
                type="primary"
                shape="circle"
                icon="search"
                onClick={this.search}
              /></Col>
          </Row>
          <br />
          <Row>
            <Col span={4}></Col>
            <Col span={20}>
              <Table
                size="small"
                dataSource={this.state.searchList}
                columns={this.searchColumns}
                rowKey="Id"
                pagination={false}
              />
            </Col>
          </Row>
          <br /><br />
          <Row>
            <Col span={4} className={style.top}>已有用户：</Col>
            <Col span={20}>
              <Table
                size="small"
                dataSource={this.state.showList}
                columns={this.showColumns}
                rowKey="Id"
                pagination={false}
              />
            </Col>
          </Row>
          <br /><br />
        </Drawer>
      );
    }
}

export default AddDrawer;