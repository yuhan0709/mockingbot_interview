import React, { Component } from 'react';
import { Drawer } from 'antd';
import style from './style.less';
import CDN from './cdn';
import Storage from './storage';
import Screenshot from './screenshot';
import Transcode from './transcode';

class QueryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

    UNSAFE_componentWillReceiveProps = async (nextProps) => {
      if (this.props.visible !== nextProps.visible) {
        this.setState({
          visible: true
        });
      }
    }

    render() {
      if (!this.state.visible) {
        return <div></div>;
      }
      const { target, billingMap } = this.props;

      return <Drawer
        width={800}
        title="查看报价"
        placement="right"
        closable={false}
        onClose={() => {
          this.setState({
            visible: false
          });
        }}
        visible={this.state.visible}
      >
        视频分发：
        <div className={style.content}>
          {target.BillingMethodMap.cdn.Value.map(region => {
            return (
              <div key={region.Key}>
                {region.DisplayName}：{billingMap.cdn[target.SettlementPeriod][region.Func.FuncName]}
                <br /><br />
                <CDN
                  {...this.props}
                  visible={this.state.visible}
                  billingMethod={region.Func}
                /><br />
              </div>
            );
          })}
        </div>
        视频存储：{billingMap.common[target.SettlementPeriod]}
        <br /><br />
        <div className={style.content}>
          <Storage
            {...this.props}
            visible={this.state.visible}
          /><br />
        </div>
        视频截图：{billingMap.common[target.SettlementPeriod]}
        <br /><br />
        <div className={style.content}>
          <Screenshot
            {...this.props}
            visible={this.state.visible}
          /><br />
        </div>
        视频转码：{billingMap.common[target.SettlementPeriod]}
        <br /><br />
        <div className={style.content}>
          <Transcode
            {...this.props}
            visible={this.state.visible}
          />
        </div>
      </Drawer>;
    }
}
export default QueryModal;