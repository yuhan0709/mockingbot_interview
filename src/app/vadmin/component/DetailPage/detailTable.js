import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import style from './style';

export default class DetailTable extends React.PureComponent {
  static propTypes = {
    // 该区域标题
    title: PropTypes.string,
    // 表格配置组 其中的item为Antd Table的props
    tables: PropTypes.arrayOf(PropTypes.shape({
      columns: PropTypes.array.isRequired,
      dataSource: PropTypes.array.isRequired,
    })),
  }
  static defaultProps = {
    title: '',
    tables: []
  }
  render() {
    const {
      title = '',
      tables = []
    } = this.props;
    if (tables.length === 0) return null;
    return (<div className={style.block}>
      <div className={style.title}>{title}</div>
      {
        tables.map((table, index) => (
          <div key={index} className={style.info}>
            <Table
              pagination={false}
              size="small"
              className={style.table}
              {...table}
            />
          </div>
        ))
      }
    </div>);
  }
}