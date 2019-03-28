import React, { Component } from 'react';
import { Modal, Alert, Input, message, Select, InputNumber } from 'antd';
import Apis from '../../../../../util/request';
import { withRouter } from 'react-router';

const Option = Select.Option;

@withRouter
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      add: false,
      specArr: [],
      price: {}
    };
  }

    UNSAFE_componentWillReceiveProps = async nextProps =>  {
      if (this.props.visible !== nextProps.visible){
        const add = nextProps.target.key === -1;
        let price = {};
        if (add) {
          price = nextProps.target.Price ? nextProps.target.Price : {
            Func: 'simple',
            Value: 0
          };
        } else {
          const bmc = (await Apis.GetProduct({ ProductId: nextProps.target.Id, AccountId: nextProps.target.AccountId })).ProductMetadata.BillingMethodCombination;
          price = bmc.Price;
        }
        this.setState({
          price,
          add,
          visible: true,
        });
      }
    }

    confirm = async () => {
      if (this.state.price.Func !== 'simple' && ((this.state.price.Interval + '').split(',').length + 1) !==  (this.state.price.Value + '').split(',').length) {
        message.error('梯度与价格不匹配');
        return;
      }
      if (this.state.add) {
        this.props.setPrice(this.state.price);
      } else {
        await Apis.UpdateProducts2({
          ProductGroupId: this.props.match.params.ID,
          List: [
            {
              Price: this.state.price,
              ProductId: this.props.target.Id,
              Period: this.props.target.SettlementPeriod,
              Status: this.props.target.Status
            }
          ]
        });
        message.success('修改成功');
        this.props.update();
      }
      this.cancel();
    }

    cancel = () => {
      this.setState({
        visible: false
      });
    }

    render() {
      return (
        <Modal
          title={'编辑价格'}
          visible={this.state.visible}
          onOk={this.confirm}
          onCancel={this.cancel}
        >
          <div>
            类型: <Select value={this.state.price.Func} style={{ width: 120 ,marginLeft: 10 }} onChange={val => {
              this.setState({
                price: {
                  ...this.state.price,
                  Func: val,
                }
              });
            }}>
              <Option value="simple">普通</Option>
              <Option value="tier2">分段定价</Option>
              <Option value="tier1">分段累计</Option>
            </Select> <br /><br />
            { this.state.price.Func ?
              (this.state.price.Func === 'simple'
                ? <div>价格： <InputNumber min={0} style={{ width: '120px' }} value={this.state.price.Value} onChange={val => {
                  this.setState({
                    price: {
                      ...this.state.price,
                      Value: val
                    }
                  });
                }}/> <br /><br /></div>
                : <div>
                梯度： <Input style={{ width: 200 }} value={this.state.price.Interval} onChange={e => {
                    this.setState({
                      price: {
                        ...this.state.price,
                        Interval: e.target.value
                      }
                    });
                  }}/> <br /><br />
                价格： <Input style={{ width: 200 }} value={this.state.price.Value} onChange={e => {
                    this.setState({
                      price: {
                        ...this.state.price,
                        Value: e.target.value
                      }
                    });
                  }}/> <br /><br />
                  <Alert
                    message='示例'
                    description={'若梯度填写“10,100”，则代表梯度区间为“0~10(含),10~100(含),大于100”，价格需要填写“价格A,价格B,价格C”三个数字对应到梯度区间，价格之间用英文逗号分隔'}
                    type='warning'
                  />
                </div>) : null
            }

          </div>
        </Modal>
      );
    }
}


export default App;