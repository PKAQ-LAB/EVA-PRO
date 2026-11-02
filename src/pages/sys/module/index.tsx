import {
  CaretDownOutlined,
  CaretUpOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { useIntl, useModel } from '@umijs/max';
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
import React, { useId, useMemo, useRef, useState } from 'react';
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
  findTreeNode,
  getDeleteBlockers,
  getSiblingMove,
} from '@/utils/treeOperations';
import useMenuAccess from '@/utils/useMenuAccess';
import { frozenText } from '../status';
import ModuleAOEForm, { type OperateType } from './aoeform';
import type { ModuleItem } from './data.d';
import {
  deleteModules,
  getModule,
  queryModules,
  sortModules,
  switchModuleStatus,
} from './service';

const { Search } = Input;

const SysModulePage: React.FC = () => {
  const canAction = useMenuAccess('/sys/module');
  const { initialState } = useModel('@@initialState');
  const queryScope = useId();
  const queryIdentity = useRef({ user: initialState?.currentUser, version: 0 });
  if (queryIdentity.current.user !== initialState?.currentUser)
    queryIdentity.current = {
      user: initialState?.currentUser,
      version: queryIdentity.current.version + 1,
    };
  const intl = useIntl();
  const view = useRecordView<ModuleItem>();
  const handleView = (record: ModuleItem) => {
    if (!canAction('read')) return;
    setCurrentItem({ id: record.id });
    setOperateType('view');
    void view.read(record.id, async () => {
      if (!canAction('read')) throw new Error('无权限');
      const res = await getModule(record.id);
      if (!canAction('read')) throw new Error('权限已变更');
      return res;
    });
  };
  const { message: msg, modal } = App.useApp();
  const [operateType, setOperateType] = useState<OperateType>('');
  const [currentItem, setCurrentItem] = useState<Partial<ModuleItem>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchName, setSearchName] = useState<string>('');
  const statusBusy = useRef(false);
  const [statusId, setStatusId] = useState<string | null>(null);

  const modulesQuery = useQuery<ModuleItem[]>({
    queryKey: ['sys', 'modules', queryScope, queryIdentity.current.version],
    enabled: canAction('list'),
    queryFn: async () => {
      if (!canAction('list')) throw new Error('无列表权限');
      const res = await queryModules();
      if (!canAction('list')) throw new Error('权限已变更');
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

  const parentLocked = (record: ModuleItem) =>
    findTreeNode(allData, record.parentId)?.frozen === 1;
  const handleStatus = (record: ModuleItem) => {
    if (!canAction('freeze')) return;
    if (
      statusBusy.current ||
      record.frozen === 9999 ||
      record.status === '9999'
    )
      return;
    const unlock = record.frozen === 1;
    if (unlock && parentLocked(record)) {
      msg.info('请先解锁上级模块');
      return;
    }
    statusBusy.current = true;
    setStatusId(record.id);
    const release = () => {
      statusBusy.current = false;
      setStatusId(null);
    };
    const submit = async () => {
      if (!canAction('freeze')) {
        release();
        return;
      }
      try {
        const res = await switchModuleStatus(
          record.id,
          unlock ? '0000' : '0001',
        );
        if (res.success !== true) throw new Error('状态修改失败');
        await refresh();
        msg.success(unlock ? '解锁成功' : '锁定成功');
      } catch {
        msg.error('状态修改失败，请重试');
      } finally {
        release();
      }
    };
    if (record.children?.length) {
      modal.confirm({
        title: unlock
          ? '确定解锁模块及其子孙节点？'
          : '确定锁定模块及其子孙节点？',
        content: '该操作会级联更新所有子孙节点，只读节点保持不变。',
        okText: '确定',
        cancelText: '取消',
        onOk: submit,
        onCancel: release,
      });
    } else {
      void submit();
    }
  };

  const handleAdd = (record?: ModuleItem) => {
    if (!canAction('create')) return;
    view.close();
    setCurrentItem(
      record ? { parentId: record.id, routeUrl: record.routeUrl ?? '' } : {},
    );
    setOperateType('create');
  };

  const handleEdit = (record: ModuleItem) => {
    if (!canAction('update')) return;
    if (!record.id) {
      modal.warning({ title: '提示', content: '没有选择记录' });
      return;
    }
    setCurrentItem({ id: record.id });
    setOperateType('edit');
    void view.read(record.id, async () => {
      if (!canAction('update')) throw new Error('无权限');
      const res = await getModule(record.id);
      if (!canAction('update')) throw new Error('权限已变更');
      return res;
    });
  };

  const handleDelete = async (record: ModuleItem) => {
    if (!canAction('delete')) return;
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
    if (!canAction('delete')) return;
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
    if (!canAction('sort')) return;
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
        if (searchName || !canAction('sort')) return text;
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
          {canAction('read') && (
            <Button
              type="link"
              size="small"
              disabled={!canAction('read')}
              onClick={() => handleView(record)}
            >
              查看
            </Button>
          )}
          {canAction('create') && (
            <Button
              type="link"
              size="small"
              disabled={!canAction('create')}
              onClick={() => handleAdd(record)}
            >
              添加下级
            </Button>
          )}
          <Divider type="vertical" />
          {canAction('update') && (
            <Button
              type="link"
              size="small"
              disabled={!canAction('update')}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {record.frozen !== 9999 &&
            record.status !== '9999' &&
            canAction('freeze') && (
              <Button
                type="link"
                size="small"
                loading={statusId === record.id}
                disabled={
                  !canAction('freeze') ||
                  statusId !== null ||
                  (record.frozen === 1 && parentLocked(record))
                }
                title={
                  record.frozen === 1 && parentLocked(record)
                    ? '请先解锁上级模块'
                    : undefined
                }
                onClick={() => handleStatus(record)}
              >
                {record.frozen === 1 ? '解锁' : '锁定'}
              </Button>
            )}
          {record.status !== '9999' && record.status !== '0000' && (
            <>
              <Divider type="vertical" />
              {canAction('delete') && (
                <a
                  className="eva-delete-link"
                  onClick={() => confirmDelete(record)}
                >
                  删除
                </a>
              )}
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
          {canAction('create') && (
            <Button
              icon={<PlusOutlined />}
              type="primary"
              disabled={!canAction('create')}
              onClick={() => handleAdd()}
              loading={modulesQuery.isLoading}
            >
              新增模块
            </Button>
          )}
          {selectedRowKeys.length > 0 && (
            <>
              <Divider type="vertical" />
              {canAction('delete') && (
                <Button
                  danger
                  disabled={!canAction('delete')}
                  onClick={confirmBatchDelete}
                >
                  删除模块
                </Button>
              )}
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
