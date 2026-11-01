import { App, Button, Card, Divider, Table, type TableColumnsType } from 'antd';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { viewRow } from '@/components/RecordView';
import {
  ActionGroup,
  actionColumn,
  textColumn,
} from '@/components/TablePresentation';
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
    if (!canWrite() || lines[index]?.frozen === 9999) return;
    setEditIndex(index);
    setModalType('edit');
  };

  const handleView = (record: DictLine) => {
    if (!activeRef.current) return;
    const index = lines.indexOf(record);
    if (index < 0) return;
    setEditIndex(index);
    setModalType('view');
  };

  const handleDelete = (index: number) => {
    if (!canWrite() || lines[index]?.frozen === 9999) return;
    const next = [...lines];
    next.splice(index, 1);
    setLines(next);
  };

  const confirmDelete = (index: number) => {
    if (!canWrite() || lines[index]?.frozen === 9999) return;
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
    textColumn<DictLine>('编码', 'keyName', 180),
    textColumn<DictLine>('描述', 'keyValue', 260),
    { ...textColumn<DictLine>('排序', 'orders', 90), align: 'right' },
    {
      title: '操作',
      ...actionColumn(220),
      render: (_, _record, index) => (
        <ActionGroup>
          <Button type="link" size="small" onClick={() => handleView(_record)}>
            查看
          </Button>
          {!isReadOnly && _record.frozen !== 9999 && (
            <>
              <a onClick={() => handleEdit(index)}>编辑</a>
              <Divider type="vertical" />
              <a
                className="eva-delete-link"
                onClick={() => confirmDelete(index)}
              >
                删除
              </a>
            </>
          )}
        </ActionGroup>
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
        scroll={{ x: 750 }}
        onRow={(record) => viewRow(() => handleView(record))}
        size="small"
        rowKey={(_record, index) => `${index}-${_record.keyName}`}
        dataSource={lines}
        columns={columns}
        pagination={false}
      />
      {modalType !== '' && (modalType === 'view' || !isReadOnly) && (
        <LineAOEForm
          modalType={modalType}
          setModalType={setModalType}
          lines={lines}
          setLines={setLines}
          editIndex={editIndex}
          setEditIndex={setEditIndex}
          isCurrent={isCurrent}
          readOnly={
            isReadOnly ||
            (editIndex !== '' && lines[editIndex]?.frozen === 9999)
          }
        />
      )}
    </Card>
  );
};

export default LineList;
