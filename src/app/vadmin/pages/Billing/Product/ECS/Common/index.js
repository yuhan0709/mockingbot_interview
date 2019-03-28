import React, { Component } from 'react';
import { Table, message, Button } from 'antd';
import { colFormat } from '@util/index';
import Apis from '../../../../../util/request';
import moment from 'moment';
import { withRouter } from 'react-router';
import EditableForm from './EditableForm';

@withRouter
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      editingKey: [],
      selectedRowKeys: [],
    };
  }

  getEnumValue(list, key) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].Value === key) {
        return list[i].DisplayName;
      }
    }
  }

  enumList = {}

  componentDidMount = async () => {
    // let res = await Apis.ListCommonProductGroup({ Limit: 999, Service: 'vod' });
    // console.log('resresresres',res)
    //  res = await Apis.ListProduct({ProductGroupId: 'vod' });
    // console.log('resresresres',res)
    const data = await Apis.ListCommonProductGroup({ Limit: 999, Service: 'ecs' });
    this.enumList = {};
    data.ProductGroupMetadatas.forEach(ele => {
      if (ele.Id === this.props.match.params.ID) {
        ele.BillingMethodSets.forEach(bms => {
          this.enumList[bms.Key] = bms.Value.List;
          this.columns.push(
            colFormat(
              bms.DisplayName,
              bms.Key,
              bms.Value.Type === 'enum' ? key => { return this.getEnumValue(bms.Value.List, key); } : false,
              {
                width: 120,
                editable: true,
                inputtype: bms.Value
              }
            ),
          );
        });
      }
    });
    this.columns = [
      ...this.columnsBefore,
      ...this.columns,
      ...this.columnsAfter,
    ];
    this.getData({ ProductGroupId: this.props.match.params.ID, Limit: 999 });
  }

  getData = async (query) => {
    query = {
      ...this.state.query,
      ...query,
    };
    const data = (await Apis.ListProduct(query)).ProductMetadatas;
    data.forEach(pm => {
      pm.key = pm.Id;
      const bmc = pm.BillingMethodCombination ? pm.BillingMethodCombination : [];
      bmc.forEach(ele => {
        pm[ele.Key] = ele.Value;
      });
    });
    this.setState({
      query,
      data,
      editingKey: []
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
    if (key !== -1) {
      const pm = (await Apis.UpdateProducts({
        ProductGroupId: this.props.match.params.ID,
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
      const pm = (await Apis.CreateProducts({
        ProductGroupId: this.props.match.params.ID,
        Info: [
          {
            Status,
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
    }
  }
  form = []
  columns = []
  columnsBefore = [
    colFormat('商品ID', 'Id', id => {
      if (!id) {
        return '-';
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
        {id.length > 10 ? id.slice(0, 3) + '...' + id.slice(-4) : id}
      </span>;
    }, {
      width: 100,
      //fixed: 'left'
    }),
  ]
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
    colFormat('修改时间', 'UpdateTime', time => {
      if (!time) {
        return '-';
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
              <EditableForm.EditableContext.Consumer>
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
              </EditableForm.EditableContext.Consumer>
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
    }, {
      width: 100,
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
      if (key !== -1) {
        const data = [...this.state.data];
        data.splice(data.findIndex(item => key === item.key), 1, item);
        const editingKey = [...this.state.editingKey];
        editingKey.splice(editingKey.indexOf(key), 1);
        this.setState({ data, editingKey });
      } else {
        const data = [...this.state.data];
        data[0] = item;
        this.setState({
          data,
          editingKey: []
        });
      }
    });
  }

  cancel = key => {
    const editingKey = [...this.state.editingKey];
    editingKey.splice(editingKey.indexOf(key), 1);
    this.setState({ editingKey });
    if (key === -1) {
      const data = [...this.state.data].slice(1,this.state.data.length);
      this.setState({ data });
    }
  };

  add = () => {
    if (this.state.editingKey.length > 0) {
      message.warning('请先保存当前内容，再点击添加，避免编辑数据丢失');
      return;
    }
    let product = { key: -1 };
    this.setState({
      data: [
        product,
        ...this.state.data
      ],
      editingKey: [
        product.key,
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
        const ProductId = {};
        if (key !== -1) {
          ProductId.ProductId = key;
        }
        Info.push({
          ...ProductId,
          Status,
          BillingMethodSet
        });
      }
    });
    if (params[0].key === -1) {
      await Apis.CreateProducts({
        ProductGroupId: this.props.match.params.ID,
        Info,
      });
    } else {
      await Apis.UpdateProducts({
        ProductGroupId: this.props.match.params.ID,
        Info,
      });
    }
    message.success('保存成功');
    this.getData();
  }

  saveAll = () => {
    const length = this.forms.length;
    const params = [];
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

  render() {
    if (!this.columns.length) {
      return <div></div>;
    }

    const components = {
      body: EditableForm.body
    };
    this.forms = [];
    const columns = this.columns.map((col) => {
      if (!col.inputtype) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable ? '1' : '0',
          inputtype: col.inputtype,
          dataindex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });
    return (
      <div>
        <Button type="primary"
          style={{ marginRight: '20px' }}
          onClick={this.add}
        >
          添加
        </Button>
        {
          this.state.editingKey.length === 0
            ?
            <Button type="primary"
              style={{ marginRight: '20px' }}
              onClick={() => {
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
            :
            <Button type="primary"
              style={{ marginRight: '20px' }}
              onClick={this.saveAll}
            >
            保存
            </Button>
        }
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
        <br /> <br />
        <div style={{ width: '100%', overflow: 'scroll', paddingBottom: '20px' }}>
          <Table
            style={{ width: this.columns.length * 130 - 30 }}
            size="small"
            rowSelection={this.rowSelection}
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