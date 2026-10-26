import { useForm } from '@tanstack/react-form';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Button,
  Input,
  Pagination,
  Select,
  Space,
  Table,
  type TableColumnsType,
  Tag,
} from 'antd';
import { viewRow } from '@/components/RecordView';
import {
  ActionGroup,
  actionColumn,
  TextCell,
} from '@/components/TablePresentation';
import type { LocalRecord } from './data.d';

interface Props {
  records: LocalRecord[];
  loading: boolean;
  busy: boolean;
  onCreate: () => void;
  onView: (record: LocalRecord) => void;
  onEdit: (record: LocalRecord) => void;
  onDelete: (record: LocalRecord) => void;
  onRefresh: () => void;
}
const columns = [
  { accessorKey: 'name' },
  { accessorKey: 'code' },
  {
    accessorKey: 'status',
    enableGlobalFilter: false,
    filterFn: 'equalsString' as const,
  },
];

export default function RecordList({
  records,
  loading,
  busy,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onRefresh,
}: Props) {
  const table = useReactTable({
    data: records,
    columns,
    getRowId: (record) => record.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });
  const search = useForm({
    defaultValues: { keyword: '', status: 'all' },
    onSubmit: ({ value }) => {
      table.setGlobalFilter(value.keyword.trim());
      table.setColumnFilters(
        value.status === 'all' ? [] : [{ id: 'status', value: value.status }],
      );
      table.setPageIndex(0);
    },
  });
  const reset = () => {
    search.reset();
    table.resetGlobalFilter();
    table.resetColumnFilters();
    table.resetSorting();
    table.setPageIndex(0);
  };
  const sortOrder = (id: string) => {
    const sort = table.getColumn(id)?.getIsSorted();
    return sort === 'asc'
      ? ('ascend' as const)
      : sort === 'desc'
        ? ('descend' as const)
        : null;
  };
  const displayColumns: TableColumnsType<LocalRecord> = [
    {
      title: '名称',
      dataIndex: 'name',
      sorter: true,
      sortOrder: sortOrder('name'),
      width: 220,
      ellipsis: { showTitle: false },
      render: (_, record) => <TextCell text={record.name} />,
    },
    {
      title: '编码',
      dataIndex: 'code',
      sorter: true,
      sortOrder: sortOrder('code'),
      width: 180,
      ellipsis: { showTitle: false },
      render: (_, record) => <TextCell text={record.code} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      ellipsis: { showTitle: false },
      render: (status) => (
        <TextCell text={status === 'enabled' ? '启用' : '停用'}>
          <Tag color={status === 'enabled' ? 'success' : 'default'}>
            {status === 'enabled' ? '启用' : '停用'}
          </Tag>
        </TextCell>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 260,
      ellipsis: { showTitle: false },
      render: (_, record) => <TextCell text={record.remark} />,
    },
    {
      title: '操作',
      key: 'actions',
      ...actionColumn(240),
      render: (_, record) => (
        <ActionGroup>
          <Button type="link" size="small" onClick={() => onView(record)}>
            查看
          </Button>
          <Button
            type="link"
            size="small"
            disabled={busy}
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            disabled={busy}
            onClick={() => onDelete(record)}
          >
            删除
          </Button>
        </ActionGroup>
      ),
    },
  ];

  return (
    <>
      <div className="eva-ribbon">
        <form
          className="eva-table-search"
          onSubmit={(event) => {
            event.preventDefault();
            void search.handleSubmit();
          }}
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Space>
            <label htmlFor="local-search-keyword">名称或编码</label>
            <search.Field name="keyword">
              {(field) => (
                <Input
                  id="local-search-keyword"
                  value={field.state.value}
                  allowClear
                  style={{ width: 200 }}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </search.Field>
          </Space>
          <Space>
            <label htmlFor="local-search-status">状态</label>
            <search.Field name="status">
              {(field) => (
                <Select
                  id="local-search-status"
                  value={field.state.value}
                  style={{ width: 110 }}
                  onChange={field.handleChange}
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'enabled', label: '启用' },
                    { value: 'disabled', label: '停用' },
                  ]}
                />
              )}
            </search.Field>
          </Space>
          <Space>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button onClick={reset}>重置</Button>
          </Space>
        </form>
      </div>
      <div className="eva-body">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            padding: 16,
            flexWrap: 'wrap',
          }}
        >
          <Button type="primary" onClick={onCreate} disabled={busy || loading}>
            新增记录
          </Button>
          <Button onClick={onRefresh} loading={loading} disabled={busy}>
            刷新
          </Button>
        </div>
        <Table<LocalRecord>
          onRow={(record) => viewRow(() => onView(record))}
          size="small"
          rowKey="id"
          loading={loading}
          columns={displayColumns}
          dataSource={table.getRowModel().rows.map((row) => row.original)}
          pagination={false}
          scroll={{ x: 1020 }}
          locale={{ emptyText: loading ? '加载中...' : '暂无记录' }}
          onChange={(_, __, sorter) => {
            const sorted = Array.isArray(sorter) ? sorter[0] : sorter;
            table.setSorting(
              sorted?.order && typeof sorted.field === 'string'
                ? [{ id: sorted.field, desc: sorted.order === 'descend' }]
                : [],
            );
          }}
        />
        {!loading && (
          <Pagination
            size="small"
            style={{
              padding: 16,
              display: 'flex',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
            current={table.getState().pagination.pageIndex + 1}
            pageSize={table.getState().pagination.pageSize}
            total={table.getFilteredRowModel().rows.length}
            showSizeChanger
            pageSizeOptions={[5, 10, 20]}
            showTotal={(total) => `共 ${total} 条`}
            onChange={(page, pageSize) => {
              table.setPageSize(pageSize);
              table.setPageIndex(page - 1);
            }}
          />
        )}
      </div>
    </>
  );
}
