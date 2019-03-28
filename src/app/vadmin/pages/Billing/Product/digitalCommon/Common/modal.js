import React, { Component } from 'react';
import { Modal, Alert, Input, message } from 'antd';
import Apis from '../../../../../util/request';
import { withRouter } from 'react-router';


class Attribute extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{ margin: '10px 0' }}>
                属性{this.props.Index}
        <Input
          style={{ display: 'inline-block', width: '130px', margin: '0 10px' }}
          value={this.props.Key}
          onChange={this.props.KeyChange}
          placeholder="请输入属性名称"
        />
                :
        <Input
          style={{ display: 'inline-block', width: '130px', margin: '0 10px' }}
          value={this.props.Value}
          onChange={this.props.ValueChange}
          placeholder="请输入属性值"
        />
        <a
          onClick={() => {
            this.props.Delete();
          }}
        >删除</a>
        {this.props.Index === this.props.Length &&
                <a
                  style={{ margin: '0 10px' }}
                  onClick={() => {
                    this.props.Add();
                  }}
                >添加</a>}
      </div>
    );
  }
}


@withRouter
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      add: false,
      specArr: []
    };
  }

    UNSAFE_componentWillReceiveProps = async nextProps =>  {
      if (this.props.visible !== nextProps.visible){
        let add = false;
        let specArr = [];
        try {
          const res = await Apis.GetSpec({
            ProductGroupId: this.props.match.params.ID,
            SpecName: nextProps.target.Flavor
          });
          Object.keys(res.Spec).forEach(key => {
            specArr.push({
              Key: key,
              Value: res.Spec[key]
            });
          });
          if (specArr.length === 0) {
            specArr = [{ Key: '', Value: '' }];
          }
        } catch (e) {
          console.log(e);
          add = true;
          specArr = [{ Key: '', Value: '' }];
        }
        this.setState({
          visible: true,
          add,
          specArr
        });
      }
    }

    confirm = async () => {
      const Spec = {};
      this.state.specArr.forEach(prop => {
        if (prop.Key) {
          Spec[prop.Key] = prop.Value;
        }
      });
      if (this.state.add) {
        await Apis.CreateSpec({
          ProductGroupId: this.props.match.params.ID,
          SpecName: this.props.target.Flavor,
          Spec: JSON.stringify(Spec)
        });
        message.success('规格创建成功');
      } else {
        await Apis.UpdateSpec({
          ProductGroupId: this.props.match.params.ID,
          SpecName: this.props.target.Flavor,
          Spec: JSON.stringify(Spec)
        });
        message.success('规格修改成功');
      }
      this.cancel();
    }

    cancel = () => {
      this.setState({
        visible: false
      });
    }

    render() {
      const target = this.props.target;
      return (
        <Modal
          title={'编辑' + this.props.ProductName + '规格'}
          visible={this.state.visible}
          onOk={this.confirm}
          onCancel={this.cancel}
        >
          <div>
            <div style={{ fontSize: '16px',color: '#000',marginBottom: '6px' }}>规格ID：{target.flavor}</div>
            {
              this.state.specArr.map((specProp, index) => {
                return <Attribute
                  Index={index + 1}
                  Length={this.state.specArr.length}
                  Key={specProp.Key}
                  Value={specProp.Value}
                  KeyChange={e => {
                    specProp.Key = e.target.value.trim().slice(0,32);
                    this.setState({
                      specArr: [...this.state.specArr]
                    });
                  }}
                  ValueChange={e => {
                    specProp.Value = e.target.value.trim().slice(0,32);
                    this.setState({
                      specArr: [...this.state.specArr]
                    });
                  }}
                  Delete={()=> {
                    let specArr = this.state.specArr;
                    specArr.splice(index, 1);
                    if (specArr.length === 0) {
                      specArr = [{ Key: '', Value: '' }];
                    }
                    this.setState({
                      specArr: [...specArr]
                    });
                  }}
                  Add={() => {
                    this.setState({
                      specArr: [...this.state.specArr, { Key: '', Value: '' }]
                    });
                  }}
                />;
              })
            }
            <Alert
              message='示例'
              description='属性名称为CPU，属性值为20核，则书写方式为“CPU:20核”'
              type='warning'
            />
          </div>
        </Modal>
      );
    }
}


export default App;