import React, { Component } from 'react';
import { message, Button, Select, Input, Upload, Icon } from 'antd';
import { colFormat } from '@util/index';
import Apis from '../../../../../util/request';
import moment from 'moment';
import { withRouter } from 'react-router';
import FormsTable from '@component/FormsTable';
import Modal from './modal';
import PriceModal from './priceModal';

const Option = Select.Option;
@withRouter
class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataResult: {},
      data: [],
      editingKey: [],
      selectedRowKeys: [],
      ProductName: '',
      modalTarget: {},
      addPrice: {},
      modalVisible: false
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
    const data = await Apis.ListCommonProductGroup({ Limit: 999, Service: this.props.match.params.service });
    this.enumList = {};
    data.ProductGroupMetadatas.forEach(ele => {
      if (ele.Id === this.props.match.params.ID) {
        this.setState({
          ProductName: ele.ProductName
        });
      }
    });
    this.getData({ ProductGroupId: this.props.match.params.ID, Limit: 15 });
  }

  getData = async (query) => {
    query = {
      ...this.state.query,
      ...query,
    };
    const dataResult = await Apis.ListProduct(query);
    const data = dataResult.ProductMetadatas;
    data.forEach((pm, index) => {
      pm.key = pm.Id;
      pm.Period = pm.SettlementPeriod;
      const bmc = pm.BillingMethodCombination ? pm.BillingMethodCombination : [];
      data[index] = { ...pm, ...bmc };
      this.AZMap[pm.key] = this.getAZ(pm.region);
    });

    this.setState({
      dataResult,
      query,
      data,
      editingKey: []
    });
    return data;
  }

  AZMap = {}

  refreshAZMap() {
    this.state.data.forEach(pm => {
      this.AZMap[pm.key] = this.getAZ(pm.region);
    });
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
      let pm = (await Apis.UpdateProducts2({
        ProductGroupId: this.props.match.params.ID,
        List: [
          {
            ...data,
            Status,
            ProductId: key,
          }
        ]
      })).ProductMetadatas[0];
      const bmc = pm.BillingMethodCombination;
      pm.key = pm.Id;
      pm.Period = pm.SettlementPeriod;
      pm = { ...pm, ...bmc };
      this.AZMap[pm.key] = this.getAZ(pm.region);
      return pm;
    } else {
      let pm = (await Apis.CreateProducts2({
        ProductGroupId: this.props.match.params.ID,
        List: [
          {
            ...data,
            Status,
            Price: this.state.addPrice
          }
        ]
      })).ProductMetadatas[0];
      const bmc = pm.BillingMethodCombination;
      pm.key = pm.Id;
      pm.Period = pm.SettlementPeriod;
      pm = { ...pm, ...bmc };
      this.AZMap[pm.key] = this.getAZ(pm.region);
      return pm;
    }
  }
  form = []

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
        this.forms = {};
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
    this.AZMap[-1] = this.getAZ();
    this.setState({
      addPrice: {
        Func: 'simple',
        Value: 0
      },
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
    const List = [];
    params.forEach(param => {
      const { row, key } = param;
      const { Status, Region, Az, Flavor, Price, Period } = row;
      if (isUpdateStatus) {
        List.push({
          ProductId: key,
          Status, Region, Az, Flavor, Price, Period
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
        List.push({
          ...row,
          ...ProductId,
          Status
        });
      }
    });
    if (params[0].key === -1) {
      await Apis.CreateProducts2({
        ProductGroupId: this.props.match.params.ID,
        List,
      });
    } else {
      await Apis.UpdateProducts2({
        ProductGroupId: this.props.match.params.ID,
        List,
      });
    }
    message.success('保存成功');
    this.getData();
  }

  forms = {}

  saveAll = () => {
    const formsArr = Object.keys(this.forms).map(key => this.forms[key]);
    const length = formsArr.length;
    const params = [];
    Object.keys(this.forms).forEach(key => {
      this.forms[key].validateFields((error, row) => {
        if (!error) {
          params.push({
            row,
            key,
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

  getAZ = region => {
    if (region && window.INIT_CONFIG.expenseConfig.RegionAZ[region]) {
      return window.INIT_CONFIG.expenseConfig.RegionAZ[region];
    } else {
      return window.INIT_CONFIG.expenseConfig.AZ;
    }
  }

  columns = [
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
    }),
    colFormat('地域', 'Region', region => {
      return window.INIT_CONFIG.expenseConfig.Region[region] ? window.INIT_CONFIG.expenseConfig.Region[region] : region;
    },{
      width: 100,
      cell: (
        <Select style={{ width: 100 }}>
          {Object.keys(window.INIT_CONFIG.expenseConfig.Region).map(key => {
            return <Option key={key} value={key}>{window.INIT_CONFIG.expenseConfig.Region[key]}</Option>;
          })}
        </Select>
      ),
      getFieldDecorator: (form, record) => {
        this.forms[record.key] = form;
        const { getFieldDecorator } = form;
        return getFieldDecorator('Region', {
          getValueFromEvent: params => { this.AZMap[record.key] = this.getAZ(params); return params; },
          initialValue: record['Region'],
        });
      }
    }),
    colFormat('可用区', 'Az', (az,record) => {
      return this.AZMap[record.key] && this.AZMap[record.key][az] ? this.AZMap[record.key][az] : az;
    },{
      width: 100,
      cell: props => {
        this.AZMap[props.record.key];
        return <Select style={{ width: 100 }}>
          {Object.keys(this.AZMap[props.record.key]).map(key => {
            return <Option key={key} value={key}>{this.AZMap[props.record.key][key]}</Option>;
          })}
        </Select>;
      },
      getFieldDecorator: (form, record) => {
        this.forms[record.key] = form;
        const { getFieldDecorator } = form;
        return getFieldDecorator('Az', {
          initialValue: record['Az'],
        });
      }
    }),
    colFormat('规格ID', 'Flavor', (flavor, record) => {
      return <a
        onClick={() => {
          this.setState({
            modalVisible: !this.state.modalVisible,
            modalTarget: record
          });
        }}
      >{flavor}</a>;
    },{
      width: 130,
      cell: (
        <Input style={{ width: '150px' }} />
      ),
      getFieldDecorator: (form, record) => {
        this.forms[record.key] = form;
        const { getFieldDecorator } = form;
        return getFieldDecorator('Flavor', {
          getValueFromEvent: event => {
            return event.target.value.trim();
          },
          initialValue: record['Flavor'],
        });
      }
    }),
    colFormat('单价', 'Price', (price, record) => {
      if (!price || !price.Func) {
        return <a onClick={() => {
          this.setState({
            modalTarget: record,
            priceVisible: !this.state.priceVisible
          });
        }}>点击编辑</a>;
      }
      const type = {
        simple: '普通',
        tier2: '分段定价',
        tier1: '分段累计'
      };
      return <div onClick={() => {
        this.setState({
          modalTarget: record,
          priceVisible: !this.state.priceVisible
        });
      }}>
        <a>类型：{type[price.Func]}</a><br />
        {price.Func !== 'simple' ? <span><a>梯度：{price.Interval}</a><br /></span> : ''}
        <a>价格：{price.Value}</a>
      </div>;

    }, {
      width: 120
    }),
    colFormat('单位', 'Unit', unit => {
      try {
        if (!unit) {
          return window.INIT_CONFIG.expenseConfig.DigitalCommonService[this.props.match.params.service].unit2;
        }
      } catch (_) {
        return unit;
      }
      return unit;
    },{
      cell: (
        <Input style={{ width: '80px' }} />
      ),
      getFieldDecorator: (form, record) => {
        this.forms[record.key] = form;
        const { getFieldDecorator } = form;
        return getFieldDecorator('Unit', {
          getValueFromEvent: event => {
            return event.target.value.trim();
          },
          initialValue: record['Unit'],
        });
      }
    }),
    colFormat('周期', 'Period', unit => {
      try {
        return window.INIT_CONFIG.expenseConfig.DigitalCommonService[this.props.match.params.service].unit[unit];
      } catch (_) {
        return unit;
      }
    },{
      cell: () => {
        if (!window.INIT_CONFIG.expenseConfig.DigitalCommonService[this.props.match.params.service]) {
          return <Select>{null}</Select>;
        }
        return  <Select style={{ width: 100 }}>
          {Object.keys(window.INIT_CONFIG.expenseConfig.DigitalCommonService[this.props.match.params.service].unit).map(key => {
            return <Option key={key} value={key}>{window.INIT_CONFIG.expenseConfig.DigitalCommonService[this.props.match.params.service].unit[key]}</Option>;
          })}
        </Select>;
      },
      getFieldDecorator: (form, record) => {
        this.forms[record.key] = form;
        const { getFieldDecorator } = form;
        return getFieldDecorator('Period', {
          initialValue: record['Period'],
        });
      }
    }),
    colFormat('状态', 'Status', status => {
      return ['下线', '上线'][status];
    },{
      cell: (
        <Select style={{ width: 75 }}>
          <Option key={0} value={0}>下线</Option>
          <Option key={1} value={1}>上线</Option>
        </Select>
      ),
      getFieldDecorator: (form, record) => {
        this.forms[record.key] = form;
        const { getFieldDecorator } = form;
        return getFieldDecorator('Status', {
          initialValue: record['Status'],
        });
      }
    }),
    colFormat('更新时间', 'UpdateTime', time => {
      if (!time) {
        return '-';
      }
      return moment.unix(time).format('YYYY-MM-DD HH:mm:ss');
    }),
    colFormat('操作', 'operation', (text, record) => {
      const editable = this.isEditing(record);
      return (
        <div>
          {editable ? (
            <span>
              <a
                style={{ marginRight: 8 }}
                onClick={()=>{
                  this.save(this.forms[record.key], record.key);
                }}
              >
                保存
              </a>
              <a
                href="javascript:;"
                onClick={() => {
                  this.refreshAZMap();
                  this.cancel(record.key);
                }}
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

  onChange = (current, size) => {
    const Limit = size;
    const Offset = (current - 1) * size;
    this.getData({ Limit,Offset });
  }

  render() {
    const pagination = {
      showQuickJumper: true,
      current: Math.floor(this.state.dataResult.Offset / this.state.dataResult.Limit) + 1,
      pageSize: this.state.dataResult.Limit,
      total: this.state.dataResult.Total,
      onChange: this.onChange
    };
    const props = {
      name: 'file',
      action: `/upload/products?ProductGroupId=${this.props.match.params.ID}`,
      headers: {
        authorization: 'authorization-text',
      },
      onChange: info => {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success('商品导入成功');
          this.getData();
        } else if (info.file.status === 'error') {
          message.error('商品导入失败');
        }
      },
    };
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
        <Upload {...props}>
          <Button>
            <Icon type="upload" /> 导入商品
          </Button>
        </Upload>
        <br /> <br />
        <FormsTable
          size="small"
          rowKey='key'
          pagination={pagination}
          rowSelection={this.rowSelection}
          columns={this.columns}
          editingKey={this.state.editingKey}
          dataSource={this.state.data}
        />
        <PriceModal
          visible={this.state.priceVisible}
          target={this.state.modalTarget}
          setPrice={price => {
            const data = this.state.data;
            data[0].Price = price;
            this.setState({
              data,
              addPrice: price
            });
          }}
          update={this.getData}
        />
        <Modal
          ProductName={this.state.ProductName}
          visible={this.state.modalVisible}
          target={this.state.modalTarget}
        />
      </div>
    );
  }
}

export default Product;