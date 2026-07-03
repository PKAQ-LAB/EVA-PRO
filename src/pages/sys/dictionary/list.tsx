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
import type { DictItem } from './data.d';

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
  onDelete: (record: DictItem) => Promise<void> | void;
}

const DictListView: React.FC<DictListProps> = ({
  data,
  loading,
  onCreate,
  onEdit,
  onDelete,
}) => {
  const { modal } = App.useApp();
  const [search, setSearch] = useState('');

  const confirmDelete = (record: DictItem) => {
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
    { title: '字典描述', dataIndex: 'name' },
    { title: '字典编码', dataIndex: 'code' },
    {
      title: '操作',
      width: 100,
      render: (_, record) =>
        record.status !== '9999' && (
          <a className="eva-delete-link" onClick={() => confirmDelete(record)}>
            删除
          </a>
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
        dataSource={filterDicts(data, search)}
        onRow={(record) => ({
          onClick: () => {
            onEdit(record);
          },
        })}
        pagination={false}
        scroll={{ y: 'calc(100vh - 315px)' }}
      />
    </div>
  );
};

export default DictListView;
