import {
  Card,
  Col,
  Modal,
  Row,
  Table,
  type TableColumnsType,
  Tree,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { textColumn } from '@/components/TablePresentation';
import useMenuAccess from '@/utils/useMenuAccess';
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
  const canAction = useMenuAccess('/sys/role');
  const requestId = useRef(0);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<RoleUserItem[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [orgs, setOrgs] = useState<unknown[]>([]);

  useEffect(() => {
    const request = ++requestId.current;
    setReady(false);
    setRecords([]);
    setChecked([]);
    if (!open || !roleId || !canAction('grantUser')) return;
    queryOrgs()
      .then((res) => {
        if (
          request === requestId.current &&
          canAction('grantUser') &&
          res.success
        )
          setOrgs(res.data ?? []);
      })
      .catch(() => {});
    void loadUsers(roleId, undefined, request);
    return () => {
      requestId.current += 1;
    };
  }, [open, roleId, canAction]);

  const loadUsers = async (
    id: string,
    deptId?: string,
    request = ++requestId.current,
  ) => {
    setReady(false);
    try {
      const res = await listRoleUsers(id, deptId);
      if (request !== requestId.current || !canAction('grantUser')) return;
      if (res.success !== true) throw new Error('授权用户读取失败');
      setRecords(res.data?.users ?? []);
      setChecked(res.data?.checked ?? []);
      setReady(true);
    } catch {
      if (request === requestId.current) setReady(false);
    }
  };
  const handleTreeSelect = async (selectedKeys: React.Key[]) => {
    if (!roleId || !canAction('grantUser')) return;
    await loadUsers(roleId, selectedKeys[0]?.toString());
  };

  const handleSubmit = async () => {
    if (!canAction('grantUser')) return;
    if (!roleId || !ready || loading) return;
    setLoading(true);
    try {
      const users = checked.map((id) => ({ userId: id }));
      const res = await saveRoleUsers(roleId, users);
      if (res.success && canAction('grantUser')) {
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
      open={open && canAction('grantUser')}
      title="选择授权用户"
      okText="保存"
      cancelText="关闭"
      centered
      okButtonProps={{
        disabled: !ready || loading || !canAction('grantUser'),
        style: !canAction('grantUser') ? { display: 'none' } : undefined,
      }}
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
