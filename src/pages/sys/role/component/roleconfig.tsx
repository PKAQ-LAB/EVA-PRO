import { Modal } from 'antd';
import React from 'react';

export interface RoleConfigProps {
  open: boolean;
  onClose: () => void;
}

const RoleConfigModal: React.FC<RoleConfigProps> = ({ open, onClose }) => (
  <Modal
    open={open}
    maskClosable={false}
    title="选择授权配置"
    okText="确定"
    cancelText="关闭"
    centered
    onOk={onClose}
    onCancel={onClose}
    styles={{ body: { backgroundColor: '#F9F9F9' } }}
  >
    <div style={{ textAlign: 'center', padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>建设中</h1>
      <h3 style={{ marginTop: 0 }}>敬请期待</h3>
    </div>
  </Modal>
);

export default RoleConfigModal;
