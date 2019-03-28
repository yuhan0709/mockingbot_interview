import React, { PureComponent } from 'react';
import { Table, Checkbox } from 'antd';
import style from './index.less';
import EditModal from './editModal.js';
import ServiceModal from './serviceModal.js';
import TableControlButton from '@component/TableControlButton';
import Link from '@component/Link';

class table extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      editVisible: false,
      serviceVisible: false,
      target: {},
      serviceMap: {
        ServiceVodOn: '视频点播',
        ServiceLiveOn: '视频直播',
        ServiceRtcOn: '实时通信'
      }
    };
  }

  onPaginationChange = (current, size) => {
    // 一行现实的页数
    if (!size){
      return;
    }
    const Limit = size;
    const Offset = (current - 1) * size;
    this.props.getData({ Limit, Offset });
    // 获取第几条
  }

  filtersChange = list => {
    list = list.map(ele => {
      for (let key in this.state.serviceMap) {
        if (this.state.serviceMap[key] === ele){
          return key;
        }
      }
      return ele;
    });
    const Services = list.toString();
    this.props.getData({ Services });
  }

  hideModal = () => {
    this.setState({
      editVisible: false,
      serviceVisible: false,
    });
  }

  render() {
    // if (!this.props.data.Limit){
    //   return <div></div>;
    // }
    const columns = [
      colFormat('用户ID', 'Id'),
      colFormat('用户名', 'Identity'),
      colFormat('邮箱', 'Email'),
      colFormat('云服务', 'CreateDate',(_, rowData) => {
        let value = '';
        if (rowData.Tags){
          rowData.Tags.forEach(ele => {
            let key = ele.TagKey;
            key = this.state.serviceMap[key] ? this.state.serviceMap[key] : key;
            value += key + ',';
          });
        }
        if (value.length) {
          value = value.slice(0, value.length - 1 );
        }
        return value;
      },{
        filters: this.props.serviceKey.map(key => {
          return this.state.serviceMap[key] ? this.state.serviceMap[key] : key;
        }),
        onChange: this.filtersChange
      }),
      colFormat('操作', 'Operate', (_, rowData) => {
        const buttons = [
          <TableControlButton
            className={style.control}
            data={rowData}
            key="edit"
            onClick={(_,rowData) => {
              this.setState({
                target: rowData,
                editVisible: true,
              });
            }}>
            编辑
          </TableControlButton>
          ,
          <Link key={rowData.Id} to={`./${rowData.Id}/`}>
            详情
          </Link>];
        return buttons;
      }),
    ];
    const pagination = {
      showQuickJumper: true,
      // 第几页
      current: Math.floor(this.props.data.Offset / this.props.data.Limit) + 1,
      pageSize: this.props.data.Limit,
      total: this.props.data.Total,
      onChange: this.onPaginationChange,
      showTotal: total => `共有 ${total} 条数据，每页显示：${this.props.data.Limit} 条`
    };

    return (
      <div>
        <Table
          dataSource={this.props.data.List}
          columns={columns}
          pagination={pagination}
        />
        <EditModal
          visible={this.state.editVisible}
          target={this.state.target}
          hideModal={this.hideModal}
          refresh={this.props.refresh}
        />
        <ServiceModal
          visible={this.state.serviceVisible}
          target={this.state.target}
          hideModal={this.hideModal}
          serviceMap={this.state.serviceMap}
          serviceKey={this.props.serviceKey}
          refresh={this.props.refresh}
        />
      </div>
    );
  }
}

function colFormat(title, key, render, filter) {
  const res = {
    title: title,
    dataIndex: key,
    key: key,
  };
  if (render) {
    res['render'] = render;
  }
  if (filter) {
    // res['filters'] =  filter.filters
    // res['onFilter'] = filter.onFilter
    // res['filteredValue'] = filter.filteredValue
    res['filterDropdown'] = <Filter
      plainOptions={filter.filters}
      onChange={filter.onChange}
    />;
  }
  return res;
}



const CheckboxGroup = Checkbox.Group;

class Filter extends PureComponent {
  state = {
    checkedList: [],
    indeterminate: false,
    checkAll: false,
  };

  propsChange = (list) => {
    this.props.onChange(list);
  }
  onChange = (checkedList) => {
    this.propsChange(checkedList);
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && (checkedList.length < this.props.plainOptions.length),
      checkAll: checkedList.length === this.props.plainOptions.length,
    });
  }
  onCheckAllChange = (e) => {
    this.propsChange(e.target.checked ? this.props.plainOptions : []);
    this.setState({
      checkedList: e.target.checked ? this.props.plainOptions : [],
      indeterminate: false,
      checkAll: e.target.checked,
    });
  }

  render() {
    return (
      <div className={style.filter}>
        <Checkbox
          indeterminate={this.state.indeterminate}
          onChange={this.onCheckAllChange}
          checked={this.state.checkAll}
        >
          全选
        </Checkbox>
        <CheckboxGroup options={this.props.plainOptions} value={this.state.checkedList} onChange={this.onChange} />
      </div>
    );
  }

}
export default table;