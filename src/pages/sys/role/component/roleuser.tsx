import {
  Card,
  Col,
  Modal,
  Row,
  Table,
  type TableColumnsType,
  Tree,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { textColumn } from '@/components/TablePresentation';
import { queryOrgs } from '../../organization/service';
import type { RoleUserItem } from '../data.d';
import { listRoleUsers, saveRoleUsers } from '../service';

export interface RoleUserProps {
  open: boolean;
  roleId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RoleUserModal: React.FC<RoleUserProps> = ({
  open,
  roleId,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<RoleUserItem[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [orgs, setOrgs] = useState<unknown[]>([]);

  useEffect(() => {
    if (!open) return;
    if (!roleId) {
      setRecords([]);
      setChecked([]);
      return;
    }
    queryOrgs().then((res) => {
      if (res.success && res.data) setOrgs(res.data);
    });
    listRoleUsers(roleId).then((res) => {
      setRecords(res?.data?.users ?? []);
      setChecked(res?.data?.checked ?? []);
    });
  }, [open, roleId]);

  const handleTreeSelect = async (selectedKeys: React.Key[]) => {
    if (!roleId) return;
    const res = await listRoleUsers(roleId, selectedKeys[0]?.toString());
    setRecords(res?.data?.users ?? []);
    setChecked(res?.data?.checked ?? []);
  };

  const handleSubmit = async () => {
    if (!roleId) return;
    setLoading(true);
    try {
      const users = checked.map((id) => ({ userId: id }));
      const res = await saveRoleUsers(roleId, users);
      if (res.success) {
        onClose();
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumnsType<RoleUserItem> = [
    textColumn<RoleUserItem>('姓名', 'name', 140),
    textColumn<RoleUserItem>('账号', 'account', 180),
    textColumn<RoleUserItem>('所属部门', 'deptName', 200),
    textColumn<RoleUserItem>('手机', 'tel', 160),
  ];

  return (
    <Modal
      confirmLoading={loading}
      maskClosable={false}
      open={open}
      title="选择授权用户"
      okText="保存"
      cancelText="关闭"
      centered
      onOk={handleSubmit}
      onCancel={onClose}
      width="60%"
      destroyOnHidden
      styles={{ body: { overflow: 'auto', padding: 0 } }}
    >
      <Row>
        <Col span={6}>
          <Card title="所属部门" size="small">
            <Tree
              showLine
              blockNode
              onSelect={handleTreeSelect}
              treeData={orgs as never}
              fieldNames={{ title: 'name', key: 'id', children: 'children' }}
              style={{ height: 456, maxHeight: 456, overflowY: 'auto' }}
            />
          </Card>
        </Col>
        <Col span={18}>
          <Table<RoleUserItem>
            size="small"
            columns={columns}
            rowKey="id"
            rowSelection={{
              selectedRowKeys: checked,
              onChange: (keys) => setChecked(keys.map(String)),
            }}
            dataSource={records}
            scroll={{ x: 740, y: 466 }}
            pagination={false}
          />
        </Col>
      </Row>
    </Modal>
  );
};

export default RoleUserModal;
