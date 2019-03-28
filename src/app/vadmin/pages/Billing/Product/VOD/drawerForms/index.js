import React, { Component } from 'react';
import CDN from './cdn';
import Storage from './storage';
import Transcode from './convert';
import { Row, Col } from 'antd';
import Apis from '../../../../../util/request';

class DrawerForms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      BillingMethodTemplates: [],
      CDN: [],
      Storage: [],
      Transcode: [],
    };
  }

  componentDidMount = async () => {
    const BillingMethodTemplates = (await Apis.ListBillingMethodTemplates()).BillingMethodTemplates;
    this.setState({
      BillingMethodTemplates,
    });
    this.UNSAFE_componentWillReceiveProps(this.props);
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (nextProps.initialValue.BillingMethodSets && (this.props.initialValue !== nextProps.initialValue || (!this.state.CDN.length && !this.state.Storage.length && !this.state.Transcode.length))) {
      const BillingMethodTemplates = [...this.state.BillingMethodTemplates];
      BillingMethodTemplates.forEach(bmt => {
        nextProps.initialValue.BillingMethodSets.forEach(bmss => {
          bmss.BillingMethodSet.forEach(bms => {
            if (bms.Id === bmt.Id) {
              bms.Interval.forEach((interval,m) => {
                interval.Interval.forEach((i,n) => {
                  bmt.BillingMethodInterval.Interval[m].Interval[n].Price = i.Price;
                });
              });
            }
          });
        });
      });
      this.setState({
        BillingMethodTemplates,
      });
    }
    if (
      this.props.BilingMethodCategory !== nextProps.BilingMethodCategory
      || this.props.PayType !== nextProps.PayType
      || (!this.state.CDN.length && !this.state.Storage.length && !this.state.Transcode.length)
    ) {
      const state = {};
      nextProps.BilingMethodCategory.forEach(key => {
        state[key] = [];
      });
      this.state.BillingMethodTemplates.forEach(bmt => {
        if ((nextProps.PayType === 'all' || nextProps.PayType === bmt.PayType) && state[bmt.Category]) {
          state[bmt.Category].push(bmt);
        }
      });

      ['CDN', 'Storage', 'Transcode'].forEach(key => {
        if (!state[key]) {
          state[key] = [];
        }
      });
      this.setState({
        ...state
      });
    }
  }

  onChange = () => {
    const data = {
      CDN: [],
      Storage: [],
      Transcode: [],
    };
    this.state.BillingMethodTemplates.forEach(bmt => {
      if (bmt.PayType === this.props.PayType && bmt.show && this.state[bmt.Category].length > 0) {
        data[bmt.Category].push(bmt.BillingMethodInterval);
      }
    });
    const arr = [];
    Object.keys(data).map(key => {
      if (data[key].length) {
        arr.push({
          Category: key,
          BillingMethodSet: data[key]
        });
      }
    });
    this.props.onChange(arr);
  }

  render() {
    return (
      <div>
        {this.state.CDN.length > 0 ? (
          <Row>
            <Col span={5} style={{ textAlign: 'right' }}>视频分发：</Col>
            <Col span={19}>
              <CDN
                read={this.props.read}
                BillingMethodTemplates={this.state.CDN}
                onChange={data => {
                  Object.keys(data).forEach(key => {
                    this.state.BillingMethodTemplates.forEach(bmt => {
                      if (key === bmt.Id && bmt.PayType === this.props.PayType) {
                        bmt.show = data[key].show;
                        data[key].dataSource.forEach(obj => {
                          const [key1, key2] = obj.key.split('key');
                          bmt.BillingMethodInterval.Interval[key1].Interval[key2].Price = obj.price;
                        });
                      }
                    });
                  });
                  this.onChange();
                }}
              />
            </Col>
          </Row>
        ) : ''}
        {this.state.Storage.length > 0 ? (
          <Row>
            <Col span={5} style={{ textAlign: 'right' }}>视频存储：</Col>
            <Col span={19}>
              <Storage
                read={this.props.read}
                BillingMethodTemplates={this.state.Storage}
                onChange={data => {
                  Object.keys(data).forEach(key => {
                    this.state.BillingMethodTemplates.forEach(bmt => {
                      if (key === bmt.Id && bmt.PayType === this.props.PayType) {
                        bmt.show = data[key].show;
                        data[key].dataSource.forEach(obj => {
                          const [key1, key2] = obj.key.split('key');
                          bmt.BillingMethodInterval.Interval[key1].Interval[key2].Price = obj.price;
                        });
                      }
                    });
                  });
                  this.onChange();
                }}
              />
            </Col>
          </Row>
        ) : ''}
        {this.state.Transcode.length > 0 ? (
          <Row>
            <Col span={5} style={{ textAlign: 'right' }}>视频转码：</Col>
            <Col span={19}>
              <Transcode
                read={this.props.read}
                BillingMethodTemplates={this.state.Transcode}
                onChange={data => {
                  Object.keys(data).forEach(key => {
                    this.state.BillingMethodTemplates.forEach(bmt => {
                      if (key === bmt.Id && bmt.PayType === this.props.PayType) {
                        bmt.show = data[key].show;
                        data[key].dataSource.forEach(obj => {
                          const [key1, key2] = obj.key.split('key');
                          bmt.BillingMethodInterval.Interval[key1].Interval[key2].Price = obj.price;
                        });
                      }
                    });
                  });
                  this.onChange();
                }}
              />
            </Col>
          </Row>
        ) : ''}
      </div>
    );
  }
}
export default DrawerForms;