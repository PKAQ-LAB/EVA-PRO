import {
  App,
  Button,
  Col,
  Input,
  Row,
  Table,
  type TableColumnsType,
} from 'antd';
import React, { useState } from 'react';
import {
  ActionGroup,
  actionColumn,
  textColumn,
} from '@/components/TablePresentation';
import type { DictItem } from './data.d';
import styles from './list.module.css';
import { isReadonlyDict } from './readonly';

const { Search } = Input;

const filterDicts = (data: DictItem[], searchText: string) => {
  if (!searchText) return data;
  return data.filter((item) => {
    const name = item.name ?? '';
    const code = item.code ?? '';
    return name.includes(searchText) || code.includes(searchText);
  });
};

export interface DictListProps {
  data: DictItem[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (record: DictItem) => Promise<void> | void;
  selectedId?: string;
  onDelete: (record: DictItem) => Promise<void> | void;
}

const DictListView: React.FC<DictListProps> = ({
  data,
  loading,
  onCreate,
  onEdit,
  selectedId,
  onDelete,
}) => {
  const { modal } = App.useApp();
  const [search, setSearch] = useState('');

  const confirmDelete = (record: DictItem) => {
    if (isReadonlyDict(record)) return;
    modal.confirm({
      title: '删除后系统中部分数据可能无法正确显示，确定要删除吗？',
      centered: true,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => onDelete(record),
    });
  };

  const columns: TableColumnsType<DictItem> = [
    textColumn<DictItem>('字典描述', 'name', 220),
    textColumn<DictItem>('字典编码', 'code', 220),
    {
      title: '操作',
      ...actionColumn(100),
      render: (_, record) => (
        <ActionGroup>
          {!isReadonlyDict(record) && (
            <Button
              type="link"
              size="small"
              danger
              className="eva-delete-link"
              onClick={(event) => {
                event.stopPropagation();
                confirmDelete(record);
              }}
            >
              删除
            </Button>
          )}
        </ActionGroup>
      ),
    },
  ];

  return (
    <div className={styles.list}>
      <Row
        className={styles.toolbar}
        style={{ padding: '10px 5px' }}
        gutter={8}
      >
        <Col span={6}>
          <Button type="primary" onClick={onCreate}>
            新增
          </Button>
        </Col>
        <Col span={18}>
          <Search
            placeholder="输入编码或名称进行搜索"
            allowClear
            onSearch={(v) => setSearch(v)}
          />
        </Col>
      </Row>
      <Table<DictItem>
        className={styles.table}
        size="small"
        bordered
        columns={columns}
        rowKey="id"
        loading={{ spinning: loading, description: '加载中...' }}
        dataSource={filterDicts(data, search)}
        rowClassName={(record) =>
          record.id === selectedId ? 'ant-table-row-selected' : ''
        }
        onRow={(record) => ({
          tabIndex: 0,
          'aria-label': `选择字典${record.name ?? record.code ?? ''}`,
          'aria-selected': record.id === selectedId,
          onClick: (event) => {
            if (
              event.target instanceof Element &&
              event.target.closest('button,a,input,[data-no-row-view]')
            ) {
              return;
            }
            void onEdit(record);
          },
          onKeyDown: (event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              void onEdit(record);
            }
          },
        })}
        pagination={false}
        scroll={{ x: 540, y: '100%' }}
      />
    </div>
  );
};

export default DictListView;
