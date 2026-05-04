import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
  Popconfirm,
  Table,
  type TableColumnsType,
} from 'antd';
import React, { useEffect, useState } from 'react';
import type { ModuleResource } from './data.d';
import ModuleLineAOEForm, { type LineModalType } from './lineaoeform';

export interface ModuleLineListProps {
  lines: ModuleResource[];
  setLines: (lines: ModuleResource[]) => void;
}

const ModuleLineList: React.FC<ModuleLineListProps> = ({ lines, setLines }) => {
  const [modalType, setModalType] = useState<LineModalType>('');
  const [editIndex, setEditIndex] = useState<number | ''>('');

  // V5 行为：lines 为空时插入一条 "全部资源" 默认行
  useEffect(() => {
    if (!lines || lines.length === 0) {
      setLines([
        { resourceDesc: '全部资源', resourceUrl: '/**', resourceType: '9999' },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const columns: TableColumnsType<ModuleResource> = [
    { title: '资源描述', dataIndex: 'resourceDesc' },
    { title: '资源路径', dataIndex: 'resourceUrl' },
    {
      title: '操作',
      width: 160,
      render: (_, record, index) =>
        record.resourceType !== '9999' && (
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
      <Divider>资源信息</Divider>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          style={{ marginBottom: 10 }}
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新增资源
        </Button>
      </div>
      <Table<ModuleResource>
        rowKey={(_record, index) => `${index}-${_record.resourceUrl}`}
        columns={columns}
        dataSource={lines}
        pagination={false}
      />
      {modalType !== '' && (
        <ModuleLineAOEForm
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

export default ModuleLineList;
