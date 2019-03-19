import React, { PureComponent } from 'react';
import styles from './index.less';

export default class Info extends PureComponent {
  render() {
    const { title, value, bordered = false } = this.props;

    return (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    )
  }
}