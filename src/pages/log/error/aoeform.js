/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Drawer } from 'antd';
import styles from './index.less';

@connect(({ loading, errorLog }) => ({
  loading: loading.models.errorLog,
  error: errorLog,
}))
export default class Error extends PureComponent {
  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'errorLog/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  render() {
    const { currentItem, modalType } = this.props.error;

    return (
      <Drawer
        closable
        width={600}
        visible={modalType !== ''}
        onClose={() => this.handleCloseForm()}
      >
        <ul className={styles.ul}>
          <li>
            <label>记录时间：</label>
            <span>{currentItem.requestTime}</span>
          </li>
          <li>
            <label>请求耗时：</label>
            <span>{currentItem.spendTime}</span>
          </li>
          <li>
            <label>类名：</label>
            <span>{currentItem.nameClass}</span>
          </li>
          <li>
            <label>请求IP：</label>
            <span>{currentItem.ip}</span>
          </li>
          <li>
            <label>方法名：</label>
            <span>{currentItem.method}</span>
          </li>
          <li>
            <label>方法参数：</label>
            <span>{currentItem.params}</span>
          </li>
          <li>
            <label>异常描述：</label>
            <span>{currentItem.exDesc}</span>
          </li>
        </ul>
      </Drawer>
    );
  }
}
