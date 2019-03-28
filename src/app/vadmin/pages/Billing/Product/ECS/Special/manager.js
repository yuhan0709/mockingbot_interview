import React, { Component } from 'react';
import { Table, message, Button, DatePicker } from 'antd';
import { colFormat } from '@util/index';
import Apis from '../../../../../util/request';
import moment from 'moment';
import { withRouter } from 'react-router';
import SearchInput from './searchInput';
import Navigate from '@util/navigate';
import EditableForm from './EditableForm';

const EditableContext = EditableForm.EditableContext;
const { RangePicker } = DatePicker;

@withRouter
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      editingKey: [],
      selectedRowKeys: [],
      columns: [],
      accountName: '',
    };
  }

  getEnumValue(list, key) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].Value === key) {
        return list[i].DisplayName;
      }
    }
  }

  param = {}

  enumList = {}

  common = []

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.init(nextProps.match.params);
  }

  componentDidMount() {
    this.init();
  }

  getBeforeColumns(common, special, productMap) {
    const list = [];
    common.map(c => {
      for (let i = 0; i < special.length; i ++){
        if (c === special[i]) {
          return;
        }
      }
      list.push(c);
    });
    const List = list.map(id => {
      return {
        'DisplayName': id,
        'Value': id,
      };
    });
    return [colFormat('商品ID', 'Id', id => {
      if (!id) {
        return '';
      }
      return <span title={'点击复制\r\n' + id} onClick={() => {
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.setAttribute('value', id);
        input.select();
        if (document.execCommand('copy')) {
          message.success('复制成功');
        }
        document.body.removeChild(input);
      }}>
        { id.length > 10 ? id.slice(0, 3) + '...' + id.slice(-4) : id}
      </span>;
    },{
      width: 120,
      notdropdownMatchSelectWidth: true,
      editable: true,
      idEdit: true,
      inputtype: {
        Type: 'enum',
        List,
        productMap
      }
    })];
  }

  init = async params => {
    this.form = [];
    let columns = [];
    this.enumList = {};
    let data = {};
    params = params ? params : this.props.match.params;
    const { ID, accountID } = params;
    if (accountID === 'add') {
      this.param = {};
      data = await Apis.ListCommonProductGroup({ Limit: 999, Service: 'ecs' });
    } else {
      const res = await Apis.GetAccountInfo({ AccountId: this.props.match.params.accountID });
      if (res[0]) {
        this.setState({
          accountName: res[0].Identity
        });
      }

      data = await Apis.ListSpecialProductGroup({ Limit: 999, ProductGroupId: ID, AccountIds: accountID });
      if (data.ProductGroupMetadatas[0]) {
        let specialProductGroup = data.ProductGroupMetadatas[0];
        const times = [moment.unix(specialProductGroup.BeginTime),moment.unix(specialProductGroup.EndTime)];
        this.setState({
          times
        });
        this.param = {};
        this.param.BeginTime = specialProductGroup.BeginTime;
        this.param.EndTime = specialProductGroup.EndTime;
        this.param.AccountId = accountID * 1;
      } else {
        message.error(`用户${accountID}不存在`);
      }
    }

    this.enumList = {};
    data.ProductGroupMetadatas.forEach(ele => {
      if (ele.Id === this.props.match.params.ID) {
        ele.BillingMethodSets.forEach(bms => {
          this.enumList[bms.Key] = bms.Value.List;
          columns.push(
            colFormat(
              bms.DisplayName,
              bms.Key,
              bms.Value.Type === 'enum' ? key => { return this.getEnumValue(bms.Value.List, key); } : false,
              {
                width: 120,
                editable: bms.Key === 'price',
                inputtype: bms.Value
              }
            ),
          );
        });
      }
    });

    const query = { ProductGroupId: ID, Limit: 999 };
    let columnsAfter = [...this.columnsAfter];
    const pms = (await Apis.ListProduct(query)).ProductMetadatas;
    const productMap = {};

    const common = pms.map(pm => {
      const bmc = pm.BillingMethodCombination ? pm.BillingMethodCombination : [];
      bmc.forEach(ele => {
        pm[ele.Key] = ele.Value;
      });
      productMap[pm.Id] = pm;
      return pm.Id;
    });

    this.common = common;

    if (accountID !== 'add') {
      query.AccountId = accountID * 1;
    } else {
      columnsAfter = columnsAfter.slice(0, this.columnsAfter.length - 1);
    }

    const special = (await this.getData(query)).map(ele => ele.Id);
    const columnsBefore = this.getBeforeColumns(common, special, productMap);
    columns = [
      ...columnsBefore,
      ...columns,
      ...columnsAfter,
    ];
    this.setState({
      columns
    });
  }

  getData = async (query) => {
    query = {
      ...this.state.query,
      ...query,
    };
    const data = (await Apis.ListProduct(query)).ProductMetadatas;
    const editingKey = [];
    if (this.props.match.params.accountID !== 'add') {
      data.forEach(pm => {
        pm.key = pm.Id;
        const bmc = pm.BillingMethodCombination ? pm.BillingMethodCombination : [];
        bmc.forEach(ele => {
          pm[ele.Key] = ele.Value;
        });
      });
    } else {
      data.forEach(pm => {
        pm.key = pm.Id;
        editingKey.push(pm.key);
        const bmc = pm.BillingMethodCombination ? pm.BillingMethodCombination : [];
        bmc.forEach(ele => {
          pm[ele.Key] = ele.Value;
        });
      });
    }
    this.setState({
      query,
      data,
      editingKey,
    });
    return data;
  }

  setData = async (key, data) => {
    const Status = data.Status;
    const BillingMethodSet = [];
    delete data.Status;
    Object.keys(data).forEach(Key => {
      const obj = {
        Key,
        Value: data[Key]
      };
      if (this.enumList[Key]) {
        obj.DisplayName = this.getEnumValue(this.enumList[Key], data[Key]);
      }
      BillingMethodSet.push(obj);
    });
    const { ID, accountID } = this.props.match.params;
    if (key) {
      const pm = (await Apis.UpdateProducts({
        ProductGroupId: ID,
        AccountId: accountID * 1,
        Info: [
          {
            Status,
            ProductId: key,
            BillingMethodSet
          }
        ]
      })).ProductMetadatas[0];
      const bmc = pm.BillingMethodCombination;
      bmc.forEach(ele => {
        pm[ele.Key] = ele.Value;
      });
      pm.key = pm.Id;
      return pm;
    } else {
      //const pm =
      (await Apis.CreateProducts({
        ProductGroupId: ID,
        AccountId: accountID * 1,
        Info: [
          {
            ProductId: key ? key : data['Id'],
            Status,
            BillingMethodSet
          }
        ]
      })).ProductMetadatas[0];
      this.init();
    //   const bmc = pm.BillingMethodCombination;
    //   bmc.forEach(ele => {
    //     pm[ele.Key] = ele.Value;
    //   });
    //   pm.key = pm.Id;
    //   return pm;
    }
  }

  form = []

  columns = []

  columnsAfter = [
    colFormat('状态', 'Status', status => {
      return ['下线', '上线'][status];
    },{
      editable: true,
      inputtype: {
        'Type': 'enum',
        'List': [{
          'DisplayName': '上线',
          'Value': 1
        },{
          'DisplayName': '下线',
          'Value': 0
        }]
      }
    }),
    colFormat('修改时间', 'UpdateTime', (time, record) => {
      if (!time) {
        return '-';
      }
      if (this.props.match.params.accountID === 'add') {
        return <EditableContext.Consumer>
          {form => {
            const index = this.forms.findIndex(item => record.key === item.key);
            if (index === -1) {
              this.forms.push({ key: record.key, form });
            } else {
              form = this.forms[index].form;
            }
            return moment.unix(time).format('YYYY-MM-DD HH:mm:ss');
          }}
        </EditableContext.Consumer>;
      }
      return moment.unix(time).format('YYYY-MM-DD HH:mm:ss');
    }, {
      width: 200,
    }),
    colFormat('操作', 'operation', (text, record) => {
      const editable = this.isEditing(record);
      return (
        <div>
          {editable ? (
            <span>
              <EditableContext.Consumer>
                {form => {
                  const index = this.forms.findIndex(item => record.key === item.key);
                  if (index === -1) {
                    this.forms.push({ key: record.key, form });
                  } else {
                    form = this.forms[index].form;
                  }
                  return <a
                    href="javascript:;"
                    onClick={() => this.save(form, record.key)}
                    style={{ marginRight: 8 }}
                  >
                    保存
                  </a>;
                }}
              </EditableContext.Consumer>
              <a
                href="javascript:;"
                onClick={() => { this.cancel(record.key); }}
              >
                取消
              </a>
            </span>
          ) : (
            <a onClick={() => this.edit(record.key)}>编辑</a>
          )}
        </div>
      );
    },{
      width: 100,
      //fixed: 'right'
    })
  ]

  isEditing = (record) => {
    return this.state.editingKey.indexOf(record.key) > -1;
  };

  edit(key) {
    this.setState({
      editingKey: [
        ...this.state.editingKey,
        key
      ]
    });
  }

  save(form, key) {
    form.validateFields( async (error, row) => {
      if (error) {
        return;
      }
      const item = await this.setData(key, row);
      if (key) {
        const data = [...this.state.data];
        data.splice(data.findIndex(item => key === item.key), 1, item);
        const editingKey = [...this.state.editingKey];
        editingKey.splice(editingKey.indexOf(key), 1);
        this.setState({ data, editingKey });
      }
    //   else {
    //     const data = [...this.state.data];
    //     data[0] = item;
    //     this.setState({
    //       data,
    //       editingKey: []
    //     });
    //   }
    });
  }

  cancel = key => {
    const editingKey = [...this.state.editingKey];
    editingKey.splice(editingKey.indexOf(key), 1);
    this.setState({ editingKey });
    if (key === 0) {
      const data = [...this.state.data].slice(1,this.state.data.length);
      this.setState({ data });
    }
  };

  add = () => {
    if (this.state.editingKey.length > 0) {
      message.warning('请先保存当前内容，再点击添加，避免编辑数据丢失');
      return;
    }
    let product = { key: 0 };
    this.setState({
      data: [
        product,
        ...this.state.data
      ],
      editingKey: [
        product.key,
        ...this.state.editingKey
      ]
    });
  }

  batchData = async (params, isUpdateStatus) => {
    const Info = [];
    params.forEach(param => {
      const { row, key } = param;
      const Status = row.Status;
      if (isUpdateStatus) {
        Info.push({
          ProductId: key,
          Status,
        });
      } else {
        const BillingMethodSet = [];
        delete row.Status;
        Object.keys(row).forEach(Key => {
          const obj = {
            Key,
            Value: row[Key]
          };
          if (this.enumList[Key]) {
            obj.DisplayName = this.getEnumValue(this.enumList[Key], row[Key]);
          }
          BillingMethodSet.push(obj);
        });
        Info.push({
          ProductId: key ? key : row['Id'],
          Status,
          BillingMethodSet
        });
      }
    });
    if (this.props.match.params.accountID === 'add') {
      if (!isUpdateStatus) {
        await Apis.CreateSpecialProductGroup({
          ProductGroupId: this.props.match.params.ID,
          ...this.param
        });
      }
      await Apis.CreateProducts({
        ProductGroupId: this.props.match.params.ID,
        Info,
        AccountId: this.param.AccountId
      }).finally(() => {
        Navigate.replace(`../${this.param.AccountId}/`);
      });
    } else {
      if (!isUpdateStatus) {
        await Apis.UpdateSpecialProductGroup({
          ProductGroupId: this.props.match.params.ID,
          ...this.param
        });
      }
      if (params[0].key === 0) {
        await Apis.CreateProducts({
          ProductGroupId: this.props.match.params.ID,
          Info,
          AccountId: this.param.AccountId
        });
        this.init();
        message.success('保存成功');
        return;
      } else {
        await Apis.UpdateProducts({
          ProductGroupId: this.props.match.params.ID,
          Info,
          AccountId: this.param.AccountId
        });
      }

    }
    message.success('保存成功');
    this.getData();
  }

  saveAll = () => {
    if (this.props.match.params.accountID === 'add') {
      if (!this.param.AccountId) {
        message.warn('请输入用户名');
        return;
      } else if (!this.param.BeginTime || !this.param.EndTime) {
        message.warn('请输入线下合作周期');
        return;
      }
    }
    const length = this.forms.length;
    const params = [];
    if (!length) {
      this.batchData(params);
    }
    this.forms.forEach(ele => {
      ele.form.validateFields((error, row) => {
        if (!error) {
          params.push({
            row,
            key: ele.key
          });
        }
        if (params.length === length) {
          this.batchData(params);
        }
      });
    });
  }

  batchStatus = status => {
    const { editingKey, selectedRowKeys, data } = this.state;
    if (editingKey.length > 0) {
      message.warning('请先保存当前内容，再批量操作，避免编辑数据丢失');
      return;
    }
    if (!selectedRowKeys.length) {
      message.warning('未选中任何商品');
      return;
    }
    const params = [];
    selectedRowKeys.forEach(key => {
      const row = data[data.findIndex(item => key === item.key)];
      row.Status = status;
      params.push({
        row,
        key,
      });
    });
    this.batchData(params, true);
  }

  rowSelection = {
    columnWidth: 40,
    onChange: selectedRowKeys => {
      this.setState({
        selectedRowKeys
      });
    }
  };

  timeChange = data => {
    this.param.BeginTime = '';
    this.param.EndTime = '';
    if (data.length === 2) {
      this.param = {
        ...this.param,
        BeginTime: data[0].toISOString(),
        EndTime: data[1].toISOString()
      };
    }
  }

  render() {
    const accountID = this.props.match.params.accountID;
    if (accountID !== 'add' && !this.state.times) {
      return <div></div>;
    }
    const components = {
      body: EditableForm.body
    };
    this.forms = [];
    const columns = this.state.columns.map((col) => {
      if (!col.inputtype) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          dropdownmatchselectwidth: col.notdropdownMatchSelectWidth ? '0' : '1',
          editable: col.editable ? '1' : '0',
          idEdit: col.idEdit,
          inputtype: col.inputtype,
          dataindex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });
    const rowSelection = {};
    if (accountID !== 'add') {
      rowSelection.rowSelection = this.rowSelection;
    }
    return (
      <div>
        {accountID !== 'add' && (<div><Button type="primary"
          style={{ marginRight: '20px' }}
          onClick={this.add}
        >
          添加
        </Button>
        <Button type="primary"
          style={{ marginRight: '20px' }}
          onClick={() => {
            if (this.state.editingKey.length > 0) {
              message.warning('请先保存当前内容，再批量操作，避免编辑数据丢失');
              return;
            }
            if (!this.state.selectedRowKeys.length) {
              message.warning('未选中任何商品');
            } else {
              this.setState({
                editingKey: [...this.state.selectedRowKeys]
              });
            }
          }}
        >
            批量编辑
        </Button>
        <Button type="primary"
          style={{ marginRight: '20px' }}
          onClick={() => {
            this.batchStatus(1);
          }}
        >
          批量上线
        </Button>
        <Button type="primary"
          style={{ marginRight: '20px' }}
          onClick={() => {
            this.batchStatus(0);
          }}
        >
          批量下线
        </Button>
        <Button type="primary"
          style={{ marginRight: '20px' }}
          onClick={this.saveAll}
        >
            保存
        </Button>
        <br /> <br />
        </div>)}
        用户名：
        <SearchInput
          value = {
            this.props.match.params.accountID !== 'add'
              ? (this.state.accountName ? this.state.accountName : this.props.match.params.accountID)
              : false
          }
          style={{ width: '200px',marginRight: '20px' }}
          placeholder='请输入用户名'
          onChange={AccountId => {
            this.param.AccountId = AccountId * 1;
          }}
        />
        线下合作周期：<RangePicker defaultValue={this.state.times} showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.timeChange}/>
        {accountID === 'add' && (
          <Button type="primary"
            style={{ marginLeft: '20px' }}
            onClick={this.saveAll}
          >
                保存
          </Button>
        )}
        <br /> <br />
        <div style={{ width: '100%', overflow: 'scroll', paddingBottom: '20px' }}>
          <Table
            size="small"
            style={{ width: this.state.columns.length * 130 - 10 }}
            {...rowSelection}
            components={components}
            bordered
            dataSource={this.state.data}
            columns={columns}
            rowKey='key'
            rowClassName="editable-row"
            pagination={false}
          />
        </div>
      </div>
    );
  }
}

export default Product;