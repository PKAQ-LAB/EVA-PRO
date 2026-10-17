import { App, Button, Card, Divider, Table, type TableColumnsType } from 'antd';
import React, { useLayoutEffect, useRef, useState } from 'react';
import type { DictLine } from './data.d';
import LineAOEForm, { type LineModalType } from './lineaoeform';

export interface LineListProps {
  lines: DictLine[];
  setLines: (lines: DictLine[]) => void;
  /** '' / 'create' / 'edit' / 'view' — view 模式禁用编辑按钮 */
  operateType: string;
  isCurrent: () => boolean;
}

const LineList: React.FC<LineListProps> = ({
  lines,
  setLines,
  operateType,
  isCurrent,
}) => {
  const { modal } = App.useApp();
  const [modalType, setModalType] = useState<LineModalType>('');
  const [editIndex, setEditIndex] = useState<number | ''>('');

  const isReadOnly = operateType === '' || operateType === 'view';
  const activeRef = useRef(false);
  const confirmationRef = useRef<ReturnType<typeof modal.confirm> | null>(null);
  useLayoutEffect(() => {
    activeRef.current = true;
    setModalType('');
    setEditIndex('');
    return () => {
      activeRef.current = false;
      confirmationRef.current?.destroy();
      confirmationRef.current = null;
    };
  }, [isCurrent]);
  const canWrite = () => activeRef.current && isCurrent() && !isReadOnly;

  const handleAdd = () => {
    if (!canWrite()) return;
    setEditIndex('');
    setModalType('create');
  };

  const handleEdit = (index: number) => {
    if (!canWrite()) return;
    setEditIndex(index);
    setModalType('edit');
  };

  const handleDelete = (index: number) => {
    if (!canWrite()) return;
    const next = [...lines];
    next.splice(index, 1);
    setLines(next);
  };

  const confirmDelete = (index: number) => {
    if (!canWrite()) return;
    confirmationRef.current?.destroy();
    confirmationRef.current = modal.confirm({
      title: '确定要删除吗？',
      centered: true,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        if (canWrite()) handleDelete(index);
      },
    });
  };

  const columns: TableColumnsType<DictLine> = [
    { title: '编码', dataIndex: 'keyName' },
    { title: '描述', dataIndex: 'keyValue' },
    { title: '排序', dataIndex: 'orders' },
    {
      title: '操作',
      align: 'center',
      width: 160,
      render: (_, _record, index) =>
        !isReadOnly && (
          <>
            <a onClick={() => handleEdit(index)}>编辑</a>
            <Divider type="vertical" />
            <a className="eva-delete-link" onClick={() => confirmDelete(index)}>
              删除
            </a>
          </>
        ),
    },
  ];

  return (
    <Card
      title="字典明细"
      styles={{ body: { padding: 15 } }}
      extra={
        <Button type="primary" onClick={handleAdd} disabled={isReadOnly}>
          新增明细
        </Button>
      }
    >
      <Table<DictLine>
        size="small"
        rowKey={(_record, index) => `${index}-${_record.keyName}`}
        dataSource={lines}
        columns={columns}
        pagination={false}
      />
      {!isReadOnly && modalType !== '' && (
        <LineAOEForm
          modalType={modalType}
          setModalType={setModalType}
          lines={lines}
          setLines={setLines}
          editIndex={editIndex}
          setEditIndex={setEditIndex}
          isCurrent={isCurrent}
        />
      )}
    </Card>
  );
};

export default LineList;
