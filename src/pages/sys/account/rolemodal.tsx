import { App, Modal, Transfer, type TransferProps } from 'antd';
import React, { useState } from 'react';
import type { AccountItem, RoleItem } from './data.d';
import { grantAccountRoles } from './service';

export interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  roles: RoleItem[];
  currentItem: AccountItem | null;
}

interface TransferRecord {
  key: string;
  title: string;
  description: string;
}

const RoleModal: React.FC<RoleModalProps> = ({
  open,
  onClose,
  roles,
  currentItem,
}) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    currentItem?.roles?.map((r) => r.id) ?? [],
  );

  const dataSource: TransferRecord[] = roles.map((r) => ({
    key: r.id,
    title: r.name,
    description: r.name,
  }));

  const handleSubmit = async () => {
    if (!currentItem?.id) return;
    setLoading(true);
    try {
      const res = await grantAccountRoles(
        currentItem.id,
        selectedRoles.map((id) => ({ id })),
      );
      if (res.success) {
        message.success('授权成功');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const onChange: TransferProps['onChange'] = (nextTargetKeys) => {
    setSelectedRoles(nextTargetKeys.map(String));
  };

  return (
    <Modal
      open={open}
      title="选择授权角色"
      okText="确定"
      cancelText="关闭"
      maskClosable={false}
      width="45%"
      centered
      confirmLoading={loading}
      onOk={handleSubmit}
      onCancel={onClose}
      styles={{ body: { height: 456, padding: 0, overflowY: 'auto' } }}
    >
      <Transfer<TransferRecord>
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        render={(item) => item.title}
        listStyle={{ width: '45%', height: '90%' }}
        dataSource={dataSource}
        targetKeys={selectedRoles}
        onChange={onChange}
        titles={['可选角色', '已选角色']}
      />
    </Modal>
  );
};

export default RoleModal;
