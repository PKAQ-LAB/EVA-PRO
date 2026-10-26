import {
  CaretDownOutlined,
  CaretUpOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { useIntl } from '@umijs/max';
import {
  Alert,
  App,
  Button,
  Divider,
  Input,
  Table,
  type TableColumnsType,
} from 'antd';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import IconMap from '@/appicon';
import { useRecordView, viewRow } from '@/components/RecordView';
import {
  ActionGroup,
  actionColumn,
  TextCell,
  textColumn,
} from '@/components/TablePresentation';
import {
  filterTree,
  getDeleteBlockers,
  getSiblingMove,
} from '@/utils/treeOperations';
import { frozenText } from '../status';
import ModuleAOEForm, { type OperateType } from './aoeform';
import type { ModuleItem } from './data.d';
import { deleteModules, getModule, queryModules, sortModules } from './service';

const { Search } = Input;

const SysModulePage: React.FC = () => {
  const intl = useIntl();
  const view = useRecordView<ModuleItem>();
  const handleView = (record: ModuleItem) => {
    setCurrentItem({ id: record.id });
    setOperateType('view');
    void view.read(record.id, () => getModule(record.id));
  };
  const { message: msg, modal } = App.useApp();
  const [operateType, setOperateType] = useState<OperateType>('');
  const [currentItem, setCurrentItem] = useState<Partial<ModuleItem>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchName, setSearchName] = useState<string>('');

  const modulesQuery = useQuery<ModuleItem[]>({
    queryKey: ['sys', 'modules'],
    queryFn: async () => {
      const res = await queryModules();
      return (res?.data ?? []) as ModuleItem[];
    },
  });

  const allData = modulesQuery.data ?? [];
  const data = useMemo(
    () =>
      searchName
        ? filterTree(
            allData,
            (node) => node.name?.includes(searchName) ?? false,
          )
        : allData,
    [allData, searchName],
  );
  const refresh = () => modulesQuery.refetch();

  const handleAdd = (record?: ModuleItem) => {
    view.close();
    setCurrentItem(
      record ? { parentId: record.id, routeUrl: record.routeUrl ?? '' } : {},
    );
    setOperateType('create');
  };

  const handleEdit = (record: ModuleItem) => {
    if (!record.id) {
      modal.warning({ title: '提示', content: '没有选择记录' });
      return;
    }
    setCurrentItem({ id: record.id });
    setOperateType('edit');
    void view.read(record.id, () => getModule(record.id));
  };

  const handleDelete = async (record: ModuleItem) => {
    const [blockItem] = getDeleteBlockers(allData, [record.id]);
    if (blockItem) {
      msg.error(`错误：[${record.name}] 存在子节点，无法删除`);
      return;
    }
    const res = await deleteModules([record.id]);
    if (res.success) {
      setSelectedRowKeys((keys) => keys.filter((key) => key !== record.id));
      refresh();
    }
  };

  const handleBatchDelete = async () => {
    const [blockItem] = getDeleteBlockers(allData, selectedRowKeys);
    if (blockItem) {
      msg.error(`错误：[${blockItem.name}] 存在子节点，无法删除`);
      return;
    }
    const res = await deleteModules(selectedRowKeys);
    if (res.success) {
      setSelectedRowKeys([]);
      refresh();
    }
  };

  const confirmDelete = (record: ModuleItem) => {
    modal.confirm({
      title: '确定要删除吗？',
      centered: true,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => handleDelete(record),
    });
  };

  const confirmBatchDelete = () => {
    modal.confirm({
      title: '确定要删除选中的条目吗?',
      centered: true,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: handleBatchDelete,
    });
  };

  const handleSort = async (record: ModuleItem, direction: 'up' | 'down') => {
    const move = getSiblingMove(allData, record.id, direction);
    if (!move) return;
    const res = await sortModules({
      id: record.id,
      oldSort: record.orders,
      newSort: move.target.orders,
    });
    if (res.success) refresh();
  };

  const columns: TableColumnsType<ModuleItem> = [
    textColumn<ModuleItem>('模块名称', 'name', 240),
    {
      title: '图标',
      dataIndex: 'icon',
      width: 100,
      ellipsis: { showTitle: false },
      render: (_, record) => (
        <TextCell text={record.icon}>
          {record.icon ? (IconMap[record.icon] ?? record.icon) : null}
        </TextCell>
      ),
    },
    {
      title: '路由地址',
      dataIndex: 'routeUrl',
      width: 260,
      ellipsis: { showTitle: false },
      render: (_, record) => <TextCell text={record.routeUrl} />,
    },
    textColumn<ModuleItem>('上级模块', 'parentName', 200),
    {
      title: '排序',
      dataIndex: 'orders',
      width: 150,
      align: 'right',
      render: (text, record) => {
        if (searchName) return text;
        const moveDown = getSiblingMove(allData, record.id, 'down');
        const moveUp = getSiblingMove(allData, record.id, 'up');
        return (
          <div data-no-row-view>
            <TextCell text={text} maxWidth={48} />
            <Divider type="vertical" />
            {moveDown ? (
              <CaretDownOutlined
                onClick={(event) => {
                  event.stopPropagation();
                  handleSort(record, 'down');
                }}
                style={{ color: '#098FFF', cursor: 'pointer' }}
              />
            ) : (
              <CaretDownOutlined style={{ opacity: 0.3 }} />
            )}
            <Divider type="vertical" />
            {moveUp ? (
              <CaretUpOutlined
                onClick={(event) => {
                  event.stopPropagation();
                  handleSort(record, 'up');
                }}
                style={{ color: '#098FFF', cursor: 'pointer' }}
              />
            ) : (
              <CaretUpOutlined style={{ opacity: 0.3 }} />
            )}
          </div>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'frozen',
      width: 110,
      align: 'center',
      ellipsis: { showTitle: false },
      render: (_, record) => (
        <TextCell text={frozenText(intl, record.frozen)} />
      ),
    },
    {
      title: '操作',
      ...actionColumn(300),
      render: (_, record) => (
        <ActionGroup>
          <Button type="link" size="small" onClick={() => handleView(record)}>
            查看
          </Button>
          <a onClick={() => handleAdd(record)}>添加下级</a>
          <Divider type="vertical" />
          <a onClick={() => handleEdit(record)}>编辑</a>
          {record.status !== '9999' && record.status !== '0000' && (
            <>
              <Divider type="vertical" />
              <a
                className="eva-delete-link"
                onClick={() => confirmDelete(record)}
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
    <PageContainer
      header={{ title: false, subTitle: false }}
      title="模块管理"
      subTitle="系统模块（菜单）管理维护"
    >
      <div className="eva-ribbon">
        <div>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => handleAdd()}
            loading={modulesQuery.isLoading}
          >
            新增模块
          </Button>
          {selectedRowKeys.length > 0 && (
            <>
              <Divider type="vertical" />
              <Button danger onClick={confirmBatchDelete}>
                删除模块
              </Button>
            </>
          )}
        </div>
        <div>
          <Search
            placeholder="输入模块名称以搜索"
            onSearch={(value) => {
              setSelectedRowKeys([]);
              setSearchName(value.trim());
            }}
            style={{ width: 280 }}
          />
        </div>
      </div>
      <div className="eva-body">
        {selectedRowKeys.length > 0 && (
          <Alert
            style={{ marginTop: 8, marginBottom: 8 }}
            type="info"
            showIcon
            message={
              <div>
                已选择{' '}
                <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
                <a
                  style={{ marginLeft: 24 }}
                  onClick={() => setSelectedRowKeys([])}
                >
                  清空选择
                </a>
              </div>
            }
          />
        )}
        <Table<ModuleItem>
          scroll={{ x: 1450 }}
          onRow={(record) => viewRow(() => handleView(record))}
          size="small"
          columns={columns}
          dataSource={data}
          loading={modulesQuery.isLoading}
          rowKey="id"
          pagination={false}
          rowSelection={
            searchName
              ? undefined
              : {
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys(keys.map(String)),
                  getCheckboxProps: (record) => ({
                    disabled: record.frozen === 9999,
                  }),
                }
          }
          rowClassName={(record) =>
            clsx({
              'eva-locked': record.frozen === 1,
              'eva-readonly': record.frozen === 9999,
            })
          }
          expandable={{ defaultExpandAllRows: true }}
        />
      </div>

      {operateType !== '' && (
        <ModuleAOEForm
          key={`${operateType}:${currentItem.id ?? 'create'}`}
          operateType={operateType}
          currentItem={
            operateType !== 'create' ? (view.data ?? currentItem) : currentItem
          }
          detailsLoading={operateType !== 'create' && view.loading}
          detailsError={operateType !== 'create' ? view.error : undefined}
          data={allData}
          onClose={() => {
            view.close();
            setOperateType('');
          }}
          onSuccess={refresh}
        />
      )}
    </PageContainer>
  );
};

export default SysModulePage;
