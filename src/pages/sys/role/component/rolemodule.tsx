import { Checkbox, Modal, Table, type TableColumnsType } from 'antd';
import React, { useEffect, useState } from 'react';
import type { RoleModuleNode } from '../data.d';
import { listRoleModules, saveRoleModules } from '../service';

export interface RoleModuleProps {
  open: boolean;
  roleId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RoleModuleModal: React.FC<RoleModuleProps> = ({
  open,
  roleId,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<RoleModuleNode[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [checkedResource, setCheckedResource] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    if (!open) return;
    if (!roleId) {
      setChecked([]);
      setRecords([]);
      setCheckedResource({});
      return;
    }
    setLoading(true);
    listRoleModules(roleId)
      .then((res) => {
        setRecords(res?.data?.modules ?? []);
        setChecked(res?.data?.checked ?? []);
        setCheckedResource(res?.data?.checkedResource ?? {});
      })
      .finally(() => setLoading(false));
  }, [open, roleId]);

  const handleSubmit = async () => {
    if (!roleId) return;
    const modules = checked.map((id) => ({ moduleId: id }));
    const res = await saveRoleModules(roleId, modules, checkedResource);
    if (res.success) {
      onClose();
      onSuccess();
    }
  };

  // 行选：勾选模块时自动选第一个资源
  const handleSelectRow = (record: RoleModuleNode, isSelected: boolean) => {
    setCheckedResource((prev) => {
      const next = { ...prev };
      if (
        isSelected &&
        record.resources &&
        (!next[record.id] || next[record.id].length < 1)
      ) {
        next[record.id] = record.resources[0]?.id
          ? [record.resources[0].id]
          : [];
      }
      if (!isSelected) {
        next[record.id] = [];
      }
      return next;
    });
  };

  // 改资源勾选
  const handleResourceClick = (resourceIds: string[], moduleId: string) => {
    if (resourceIds.length < 1) {
      Modal.warning({ title: '警告', content: '至少选择一个资源' });
      return;
    }
    setCheckedResource((prev) => ({ ...prev, [moduleId]: resourceIds }));
    setChecked((prev) =>
      prev.includes(moduleId) ? prev : [...prev, moduleId],
    );
  };

  const columns: TableColumnsType<RoleModuleNode> = [
    { title: '模块名称', dataIndex: 'name' },
    {
      title: '资源权限',
      align: 'left',
      dataIndex: 'resources',
      render: (_, record) => {
        const options = (record.resources ?? []).map((r) => ({
          label: r.resourceDesc,
          value: r.id,
        }));
        return (
          <Checkbox.Group
            options={options}
            value={checkedResource[record.id] ?? []}
            onChange={(vals) =>
              handleResourceClick(vals.map(String), record.id)
            }
          />
        );
      },
    },
  ];

  return (
    <Modal
      open={open}
      maskClosable={false}
      title="选择授权模块"
      okText="确定"
      cancelText="关闭"
      width="45%"
      centered
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnHidden
      styles={{ body: { height: 456, padding: 0, overflowY: 'auto' } }}
    >
      {records.length > 0 ? (
        <Table<RoleModuleNode>
          size="small"
          loading={loading}
          style={{ height: 456, maxHeight: 456 }}
          columns={columns}
          dataSource={records}
          pagination={false}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: checked,
            onSelect: (record, isSelected) =>
              handleSelectRow(record, isSelected),
            onChange: (keys) => setChecked(keys.map(String)),
          }}
          expandable={{ defaultExpandAllRows: true }}
        />
      ) : null}
    </Modal>
  );
};

export default RoleModuleModal;
