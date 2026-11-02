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
import { type DictRow, dictIdentity, dictionaryRows } from './readonly';

const { Search } = Input;

export interface DictListProps {
  grouped?: boolean;
  canCreate?: boolean;
  createVisible?: boolean;
  canDelete?: (record: DictItem) => boolean;
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
  grouped = false,
  canCreate = false,
  createVisible = true,
  canDelete = () => false,
}) => {
  const { modal } = App.useApp();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string[]>([
    'category:SYSTEM',
    'category:BUSINESS',
  ]);

  const confirmDelete = (record: DictItem) => {
    if (!canDelete(record)) return;
    modal.confirm({
      title: '删除后系统中部分数据可能无法正确显示，确定要删除吗？',
      centered: true,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => canDelete(record) && onDelete(record),
    });
  };

  const columns: TableColumnsType<DictRow> = [
    textColumn<DictRow>('字典描述', 'name', 220),
    textColumn<DictRow>('字典编码', 'code', 220),
    {
      title: '操作',
      ...actionColumn(100),
      render: (_, record) => (
        <ActionGroup>
          {!record.virtual && canDelete(record as DictItem) && (
            <Button
              type="link"
              size="small"
              danger
              className="eva-delete-link"
              onClick={(event) => {
                event.stopPropagation();
                confirmDelete(record as DictItem);
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
          {createVisible && (
            <Button type="primary" onClick={onCreate} disabled={!canCreate}>
              新增
            </Button>
          )}
        </Col>
        <Col span={18}>
          <Search
            placeholder="输入编码或名称进行搜索"
            allowClear
            onSearch={(v) => setSearch(v)}
          />
        </Col>
      </Row>
      <Table<DictRow>
        className={`eva-page-table ${styles.table}`}
        size="small"
        bordered
        columns={columns}
        rowKey={(record) => (record.virtual ? record.id : dictIdentity(record))}
        loading={{ spinning: loading, description: '加载中...' }}
        dataSource={dictionaryRows(data, grouped, search)}
        expandable={{
          expandedRowKeys: expanded,
          onExpandedRowsChange: (keys) => setExpanded(keys.map(String)),
        }}
        rowClassName={(record) =>
          !record.virtual && dictIdentity(record) === selectedId
            ? 'ant-table-row-selected'
            : ''
        }
        onRow={(record) => ({
          tabIndex: record.virtual ? undefined : 0,
          'aria-label': `选择字典${record.name ?? record.code ?? ''}`,
          'aria-selected':
            !record.virtual && dictIdentity(record) === selectedId,
          onClick: (event) => {
            if (record.virtual) return;
            if (
              event.target instanceof Element &&
              event.target.closest(
                'button,a,input,[data-no-row-view],.ant-table-row-expand-icon',
              )
            ) {
              return;
            }
            void onEdit(record as DictItem);
          },
          onKeyDown: (event) => {
            if (record.virtual) return;
            if (event.target !== event.currentTarget) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              void onEdit(record as DictItem);
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
