import React, { Component } from 'react';

import style from './index.less';

export default class UserInfo extends Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { name } = this.props;
    return <div className={style['user-info']}>{name}</div>;
  }
}
