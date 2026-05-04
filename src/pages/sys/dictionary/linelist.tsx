import {
  Button,
  Divider,
  Popconfirm,
  Table,
  type TableColumnsType,
} from 'antd';
import React, { useState } from 'react';
import type { DictLine } from './data.d';
import LineAOEForm, { type LineModalType } from './lineaoeform';

export interface LineListProps {
  lines: DictLine[];
  setLines: (lines: DictLine[]) => void;
  /** '' / 'create' / 'edit' / 'view' — view 模式禁用编辑按钮 */
  operateType: string;
}

const LineList: React.FC<LineListProps> = ({
  lines,
  setLines,
  operateType,
}) => {
  const [modalType, setModalType] = useState<LineModalType>('');
  const [editIndex, setEditIndex] = useState<number | ''>('');

  const isReadOnly = operateType === '' || operateType === 'view';

  const handleAdd = () => {
    setEditIndex('');
    setModalType('create');
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setModalType('edit');
  };

  const handleDelete = (index: number) => {
    const next = [...lines];
    next.splice(index, 1);
    setLines(next);
  };

  const columns: TableColumnsType<DictLine> = [
    { title: '编码', dataIndex: 'keyName' },
    { title: '描述', dataIndex: 'keyValue' },
    { title: '排序', dataIndex: 'orders' },
    {
      title: '操作',
      width: 160,
      render: (_, _record, index) =>
        !isReadOnly && (
          <>
            <a onClick={() => handleEdit(index)}>编辑</a>
            <Divider type="vertical" />
            <Popconfirm
              title="确定要删除吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => handleDelete(index)}
            >
              <a>删除</a>
            </Popconfirm>
          </>
        ),
    },
  ];

  return (
    <>
      <div className="eva-ribbon">
        <div>字典明细</div>
        <div>
          <Button type="primary" onClick={handleAdd} disabled={isReadOnly}>
            新增明细
          </Button>
        </div>
      </div>
      <Table<DictLine>
        rowKey={(_record, index) => `${index}-${_record.keyName}`}
        dataSource={lines}
        columns={columns}
        pagination={false}
        style={{ padding: 15 }}
      />
      {modalType !== '' && (
        <LineAOEForm
          modalType={modalType}
          setModalType={setModalType}
          lines={lines}
          setLines={setLines}
          editIndex={editIndex}
          setEditIndex={setEditIndex}
        />
      )}
    </>
  );
};

export default LineList;
