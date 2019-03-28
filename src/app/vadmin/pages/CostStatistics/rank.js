import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import formatValue,{ formatByte } from '../../util/valueFormat';

const bandWidthColumns = [{
  title: '序号',
  dataIndex: 'index',
  key: 'index',
  align: 'center',
  width: '33.3%',
}, {
  title: '域名',
  dataIndex: 'Domain',
  key: 'Domain',
  align: 'center',
  width: '33.3%',
}, {
  title: '带宽量',
  dataIndex: 'Bandwidth',
  key: 'Bandwidth',
  align: 'center',
  width: '33.3%',
  render: bandwidth => formatValue(bandwidth) + 'bps'
}];

const spaceColumns = [{
  title: '序号',
  dataIndex: 'index',
  key: 'index',
  align: 'center',
  width: '33.3%',
}, {
  title: '应用',
  dataIndex: 'Application',
  key: 'Application',
  align: 'center',
  width: '33.3%',
}, {
  title: '存储量',
  dataIndex: 'Storage',
  key: 'Storage',
  align: 'center',
  width: '33.3%',
  render: space => formatByte(space)
}];

const FlowColumns = [{
  title: '序号',
  dataIndex: 'index',
  key: 'index',
  align: 'center',
  width: '33.3%',
}, {
  title: '域名',
  dataIndex: 'Domain',
  key: 'Domain',
  align: 'center',
  width: '33.3%',
}, {
  title: '流量',
  dataIndex: 'Bandwidth',
  key: 'Bandwidth',
  align: 'center',
  width: '33.3%',
  render: space => formatByte(space)
}];

const options = {
  bandwidth: {
    title: '域名带宽排名',
    columns: bandWidthColumns
  },
  space: {
    title: '域名带宽排名',
    columns: spaceColumns
  },
  flow: {
    title: '域名流量排名',
    columns: FlowColumns
  }
};

class Rank extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
  }

  render() {
    const option = options[this.props.type];
    return (
      <div>
        <div>
          <h2 align="center">TOP {this.props.dataSource.length} {option.title}（按日核算）</h2>
          <Table size="small" rowKey="index" dataSource={this.props.dataSource} columns={option.columns}
            pagination={false}/>
        </div>
      </div>
    );
  }
}

Rank.defaultProps = {
  type: 'bandwidth',
  dataSource: []
};

Rank.propTypes = {
  type: PropTypes.string,
  dataSource: PropTypes.array
};

export default Rank;