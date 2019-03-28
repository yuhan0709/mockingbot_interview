import React from 'react';
import { Spin } from 'antd';
import DetailHeader from './detailHeader';
import DetailTable from './detailTable';
import style from './style.less';
import Link from '@component/Link';
import PropTypes from 'prop-types';

export default class OrderDetail extends React.PureComponent {
  static propTypes = {
    // 左上角返回链接的跳转地址
    backLink: PropTypes.string,
    // 返回链接文字
    backText: PropTypes.string,
    // 左上角标题
    barTitle: PropTypes.string,
    // 头部部分配置
    headerConfig: PropTypes.shape(DetailHeader.propTypes),
    // 详情表格配置
    tableConfig: PropTypes.shape(DetailTable.propTypes),
    // tip 位于标题与头部之间
    tip: PropTypes.element,
    dataReady: PropTypes.bool,
  }
  static defaultProps = {
    backLink: '../',
    backText: '返回订单管理列表',
    headerConfig: {},
    tableConfig: {},
    dataReady: false
  }
  render() {
    const {
      backLink,
      backText,
      barTitle,
      headerConfig = {},
      tableConfig = {},
      tip,
      dataReady,
    } = this.props;
    if (!dataReady) return <Spin className={style.spin} />;
    const {
      title: headerTitle = '',
      rows = [],
    } = headerConfig;
    const {
      title: tableTitle = '',
      tables = [],
    } = tableConfig;
    return (<div className={style.container}>
      <div className={style.bar}>
        <Link to={backLink}>{`< ${backText}`}</Link>
        <span className={style.title}>{barTitle}</span>
      </div>
      {
        tip && (
          <div className={style.block}>
            {tip}
          </div>
        )
      }
      <DetailHeader title={headerTitle} rows={rows}/>
      <DetailTable title={tableTitle} tables={tables}/>
    </div>);
  }
}