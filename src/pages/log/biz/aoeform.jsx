/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component } from 'react';
import { Drawer } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import styles from './index.less';

@connect(state => ({
  bizlog: state.bizlog,
}))
export default class AOEForm extends Component {
  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'bizlog/updateState',
      payload: {
        drawerCheck: '',
      },
    });
  };

  render() {
    const { drawerCheck, currentItemcheck } = this.props.bizlog;
    return (
      <Drawer
        closable
        width={600}
        visible={drawerCheck === 'check'}
        onClose={() => this.handleCloseForm()}
      >
        <ul className={styles.ul}>
          <li>
            <label>操作时间：</label>
            <span>{moment(currentItemcheck.operateDatetime).format('MM-DD HH:mm')}</span>
          </li>
          <li>
            <label>操作人：</label>
            <span>{currentItemcheck.operator}</span>
          </li>
          <li>
            <label>操作类型：</label>
            <span>{currentItemcheck.operateType}</span>
          </li>
          <li>
            <label>描述：</label>
            <span>{currentItemcheck.description}</span>
          </li>
        </ul>
      </Drawer>
    );
  }
}
