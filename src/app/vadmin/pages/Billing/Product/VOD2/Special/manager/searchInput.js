import React, { Component } from 'react';
import { Select, Input } from 'antd';
import Apis from '../../../../../../util/request';

const Option = Select.Option;

class Product extends Component {
    state = {
      data: [],
      value: undefined,
    }

    handleSearch = async Identity => {
      if (Identity === '') {
        this.setState({
          data: []
        });
        return;
      }
      const res = await Apis.GetAccountIdFuzzy({ Identity });
      const data = res.map(ele => {
        return {
          text: ele.Identity,
          value: ele.Id
        };
      });
      this.setState({
        data
      });
    }

    handleChange = (value) => {
      this.setState({ value });
      this.props.onChange(value);
    }

    render() {
      const input = {};
      if (this.props.value) {
        input.style = this.props.style;
        input.disabled = true;
        input.value = this.props.value;
        return <Input {...input} />;
      }
      const options = this.state.data.map(d => <Option key={d.value}>{d.text}</Option>);
      return (
        <Select
          showSearch
          value={this.state.value}
          placeholder={this.props.placeholder}
          style={this.props.style}
          defaultActiveFirstOption={false}
          showArrow={false}
          filterOption={false}
          onSearch={this.handleSearch}
          onChange={this.handleChange}
          notFoundContent={null}
        >
          {options}
        </Select>
      );
    }
}

export default Product;