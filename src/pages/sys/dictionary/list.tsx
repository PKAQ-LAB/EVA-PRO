import {
  Button,
  Col,
  Input,
  Popconfirm,
  Row,
  Table,
  type TableColumnsType,
} from 'antd';
import React, { useState } from 'react';
import { dictFilter } from '@/utils/DataHelper';
import type { DictItem } from './data.d';

const { Search } = Input;

export interface DictListProps {
  data: DictItem[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (record: DictItem) => Promise<void> | void;
  onDelete: (record: DictItem) => Promise<void> | void;
}

const DictListView: React.FC<DictListProps> = ({
  data,
  loading,
  onCreate,
  onEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState('');

  const columns: TableColumnsType<DictItem> = [
    { title: '字典描述', dataIndex: 'name' },
    { title: '字典编码', dataIndex: 'code' },
    {
      title: '操作',
      width: 100,
      render: (_, record) =>
        record.status !== '9999' &&
        !record.parent &&
        record.parentId !== '0' && (
          <Popconfirm
            title="删除后系统中部分数据可能无法正确显示，确定要删除吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => onDelete(record)}
          >
            <a>删除</a>
          </Popconfirm>
        ),
    },
  ];

  return (
    <div>
      <Row style={{ padding: '10px 5px' }} gutter={8}>
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
        bordered
        columns={columns}
        rowKey="id"
        loading={loading}
        dataSource={dictFilter(data as never, search) as DictItem[]}
        onRow={(record) => ({
          onClick: () => {
            // 根节点不加载
            if (record.parentId === '0' || !record.parentId) return;
            onEdit(record);
          },
        })}
        pagination={false}
        expandable={{ defaultExpandAllRows: true }}
      />
    </div>
  );
};

export default DictListView;
