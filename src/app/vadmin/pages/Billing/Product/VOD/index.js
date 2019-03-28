import React, { Component } from 'react';
import { Tabs } from 'antd';
import ProductManager from './product/index';
import Billing from './billing/index';
const TabPane = Tabs.TabPane;

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {

  }

  render() {
    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="商品管理" key="1">
          <ProductManager></ProductManager>
        </TabPane>
        <TabPane tab="预置计费法" key="2">
          <Billing></Billing>
        </TabPane>
      </Tabs>
    );
  }
}

export default Product;