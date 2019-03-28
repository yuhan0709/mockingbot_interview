import React from 'react';
import PropTypes from 'prop-types';
import style from './style';

// col对象 与Antd Col Props保持一致 其中content属性为Col的内容
const colPropsType = PropTypes.shape({
  span: PropTypes.number,
  content: PropTypes.element.isRequired
});
// 键值对对象，包含label col 与 value col
const labelValueGroupType = PropTypes.shape({
  label: PropTypes.shape(colPropsType),
  value: PropTypes.shape(colPropsType).isRequired,
});
export default class DetailHeader extends React.PureComponent {
  static propTypes = {
    // 该区域标题
    title: PropTypes.string,
    // 头部信息行对象，每行包含多个键值对对象
    rows: PropTypes.arrayOf(PropTypes.arrayOf(labelValueGroupType)),
  }
  static defaultProps = {
    title: '',
    rows: []
  }
  render() {
    const {
      title,
      rows = [],
    } = this.props;
    if (rows.length === 0) return null;
    return (<div className={`content-box ${style.block}`}>
      <div className={style.title}>{title}</div>
      <div className={style.info}>
        {
          rows.map((row, index) => {
            return (<div key={index} className={style.row}>
              {
                row.map((colGroup) => {
                  const { value, label } = colGroup;
                  return [
                    <div key="label" className={style.label}>{label.content}</div>,
                    <div key="value" className={style.value}>{value.content}</div>
                  ];
                })
              }
            </div>);
          })
        }
      </div>
    </div>);
  }
}