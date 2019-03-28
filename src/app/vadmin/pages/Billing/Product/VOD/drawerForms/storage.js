import React, { Component } from 'react';
import Form from './form';
import { Tabs, Checkbox } from 'antd';
import style from './style.less';

const TabPane = Tabs.TabPane;
const CheckboxGroup = Checkbox.Group;

class Storage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      options: [],
      selected: [],
      map: {},
    };
  }

  componentDidMount() {
    this.init(this.props.BillingMethodTemplates);
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (this.props.BillingMethodTemplates !== nextProps.BillingMethodTemplates){
      this.init(nextProps.BillingMethodTemplates);
    }
  }

  init = (BillingMethodTemplates) => {
    const map = {};
    const options = [];
    const selected = [];
    BillingMethodTemplates.forEach((bmt,i) => {
      const eles = bmt.BillingMethodInterval.Interval;
      const unit = 'GB';
      const columns = [{
        title: '阶梯(' + unit + ')',
        dataIndex: 'interval',
      }, {
        title: '单价(元/' + unit + ')',
        dataIndex: 'price',
        width: '60%',
        editable: true,
      }];
      const dataSource = [];
      eles.forEach((ele, key1) => {
        ele.Interval.forEach((obj, key2) => {
          let interval = 'X';
          if (obj.Lt) {
            interval = interval + ' < ' + obj.Lt;
          }
          if (obj.Gte) {
            interval = obj.Gte + ' <= ' + interval;
          }
          dataSource.push({
            key: key1 + 'key' + key2,
            price: obj.Price,
            interval
          });
        });
      });
      options.push({
        label: bmt.Name,
        value: bmt.Id,
      });
      let show = false;
      if (i === 0) {
        show = true;
        selected.push(bmt.Id);
      }
      map[bmt.Id] = {
        show,
        name: bmt.Name,
        columns,
        dataSource
      };
    });
    this.setState({
      map,
      options,
      selected,
    });
    this.props.onChange({ ...map });
  }

  render() {
    return (
      <div className={style.formTalbe}>
        <CheckboxGroup
          disabled={this.props.read}
          options={this.state.options}
          value={this.state.selected}
          onChange={selected => {
            if (selected.length > 0){
              const map = {
                ...this.state.map
              };
              Object.keys(this.state.map).forEach(key => {
                map[key].show = false;
              });
              selected.forEach(key => {
                map[key].show = true;
              });
              this.setState({
                map,
                selected
              });
              this.props.onChange({ ...map });
            }
          }}/><br /><br />
        <Tabs type="card">
          {Object.keys(this.state.map).map(key => {
            if (this.state.map[key].show)
              return <TabPane tab={this.state.map[key].name} key={key}>
                <Form
                  read={this.props.read}
                  columns={this.state.map[key].columns}
                  dataSource={this.state.map[key].dataSource}
                  onChange={dataSource => {
                    this.setState({
                      map: {
                        ...this.state.map,
                        [key]: {
                          ...this.state.map[key],
                          dataSource,
                        },
                      }
                    }, () => {
                      this.props.onChange({ ...this.state.map });
                    });

                  }}
                />
              </TabPane>;
          })}
        </Tabs>
      </div>
    );
  }
}
export default Storage;