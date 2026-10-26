import { PlusOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { App, Button, Divider, Table, type TableColumnsType } from 'antd';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { viewRow } from '@/components/RecordView';
import {
  ActionGroup,
  actionColumn,
  TextCell,
  textColumn,
} from '@/components/TablePresentation';
import type { ModuleResource } from './data.d';
import ModuleLineAOEForm, { type LineModalType } from './lineaoeform';

export interface ModuleLineListProps {
  lines: ModuleResource[];
  setLines: (lines: ModuleResource[]) => void;
  readOnly?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
}

const ModuleLineList: React.FC<ModuleLineListProps> = ({
  lines,
  setLines,
  readOnly = false,
  onDialogOpenChange,
}) => {
  const { modal } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const [modalType, setModalType] = useState<LineModalType>('');
  const [editIndex, setEditIndex] = useState<number | ''>('');
  const [viewRecord, setViewRecord] = useState<ModuleResource>();
  const writable = useRef(!readOnly);
  useLayoutEffect(() => {
    writable.current = !readOnly;
    return () => {
      writable.current = false;
    };
  }, [readOnly]);
  useEffect(() => {
    onDialogOpenChange?.(modalType !== '');
    return () => onDialogOpenChange?.(false);
  }, [modalType, onDialogOpenChange]);
  useEffect(() => {
    if (readOnly && modalType !== 'view') setModalType('');
  }, [readOnly, modalType]);
  const handleView = (record: ModuleResource) => {
    setViewRecord({ ...record });
    setModalType('view');
  };
  const resourceTypeDict = (
    initialState?.dict as Record<string, unknown> | undefined
  )?.RESOURCE_TYPE as Record<string, string> | undefined;

  const handleAdd = () => {
    if (!writable.current) return;
    setEditIndex('');
    setModalType('create');
  };

  const handleEdit = (index: number) => {
    if (!writable.current) return;
    setEditIndex(index);
    setModalType('edit');
  };

  const handleDelete = (index: number) => {
    if (!writable.current) return;
    const next = [...lines];
    next.splice(index, 1);
    setLines(next);
  };

  const confirmDelete = (index: number) => {
    if (!writable.current) return;
    modal.confirm({
      title: '确定要删除吗？',
      centered: true,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => handleDelete(index),
    });
  };

  const columns: TableColumnsType<ModuleResource> = [
    textColumn<ModuleResource>('资源描述', 'resourceDesc', 220),
    textColumn<ModuleResource>('资源路径', 'resourceUrl', 300),
    {
      title: '资源类型',
      dataIndex: 'resourceType',
      width: 140,
      align: 'center',
      ellipsis: { showTitle: false },
      render: (_, record) => (
        <TextCell
          text={
            resourceTypeDict?.[record.resourceType ?? ''] ?? record.resourceType
          }
        />
      ),
    },
    {
      title: '操作',
      ...actionColumn(220),
      render: (_, record, index) => (
        <ActionGroup>
          <Button type="link" size="small" onClick={() => handleView(record)}>
            查看
          </Button>
          {!readOnly && record.resourceType !== '*' && (
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
    <>
      <Divider>资源信息</Divider>
      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            style={{ marginBottom: 10 }}
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAdd()}
          >
            新增资源
          </Button>
        </div>
      )}
      <Table<ModuleResource>
        scroll={{ x: 880 }}
        onRow={(record) => viewRow(() => handleView(record))}
        size="small"
        rowKey={(_record, index) => `${index}-${_record.resourceUrl}`}
        columns={columns}
        dataSource={lines}
        pagination={false}
      />
      {modalType !== '' && (!readOnly || modalType === 'view') && (
        <ModuleLineAOEForm
          modalType={modalType}
          setModalType={setModalType}
          lines={lines}
          setLines={(next) => {
            if (writable.current) setLines(next);
          }}
          editIndex={editIndex}
          setEditIndex={setEditIndex}
          resourceTypeDict={resourceTypeDict}
          viewRecord={viewRecord}
          readOnly={readOnly}
        />
      )}
    </>
  );
};

export default ModuleLineList;
