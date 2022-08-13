import React from 'react';
import { Modal } from 'antd';

export default (props) => {
  const { operateType, setOperateType } = props;

  return (
    <Modal
      visible={operateType === 'Config'}
      maskClosable={false}
      title="选择授权配置"
      okText="确定"
      cancelText="关闭"
      centered
      onOk={() => setOperateType("")}
      onCancel={() => setOperateType("")}
      bodyStyle={{ backgroundColor: '#F9F9F9' }}
    >
      <div style={{ textAlign: 'center' }}>
        <img alt="" src='/building.png' />
        <h1>建设中</h1>
        <h3>敬请期待</h3>
      </div>
    </Modal>
  );
}
