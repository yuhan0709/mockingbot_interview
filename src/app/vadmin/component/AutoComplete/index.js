import React, { Component } from 'react';
import { AutoComplete as AntdAutoComplete, Input, Icon } from 'antd';
// import PropTypes from 'prop-types';

class AutoComplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    };
  }

  handleSearch = (value) => {
    console.log('handle search');
    this.setState({
      dataSource: !value ? [] : [
        value,
        value + value,
        value + value + value,
      ],
    });
  }

  onSelect(value) {
    console.log('onSelect', value);
  }

  render() {
    const { dataSource } = this.state;
    return (
      <AntdAutoComplete
        dataSource={dataSource}
        style={{ width: 200 }}
        onSelect={this.onSelect}
        onSearch={this.handleSearch}
        placeholder="请输入用户名"
      >
        <Input suffix={<Icon type="search"/>}/>
      </AntdAutoComplete>
    );
  }
}

AutoComplete.defaultProps = {};

AutoComplete.propTypes = {};

export default AutoComplete;