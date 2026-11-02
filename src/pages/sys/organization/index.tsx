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
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
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
import OrgAOEForm, { type OperateType } from './aoeform';
import type { OrgItem } from './data.d';
import { deleteOrgs, getOrg, queryOrgs, sortOrgs } from './service';

const { Search } = Input;

const SysOrganizationPage: React.FC = () => {
  const canAction = useMenuAccess('/sys/organization');
  const { initialState } = useModel('@@initialState');
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const canList = canAction('list');
  const canSave = canAction('create');
  const canDelete = canAction('delete');
  const canSort = canAction('sort');
  const canRead = (_record: OrgItem) => canAction('read');
  const canWrite = () => canAction('update');
  const queryScope = useId();
  const queryIdentity = useRef({ user: initialState?.currentUser, version: 0 });
  if (queryIdentity.current.user !== initialState?.currentUser)
    queryIdentity.current = {
      user: initialState?.currentUser,
      version: queryIdentity.current.version + 1,
    };
  const intl = useIntl();
  const view = useRecordView<OrgItem>();
  const handleView = (record: OrgItem) => {
    if (!canRead(record)) return;
    setCurrentItem({ id: record.id });
    setOperateType('view');
    void view.read(record.id, async () => {
      if (!canRead(record)) throw new Error('无权限查看部门');
      const res = await getOrg(record.id);
      if (!canRead(record)) throw new Error('权限已变更');
      return res;
    });
  };
  const { message: msg, modal } = App.useApp();
  const [operateType, setOperateType] = useState<OperateType>('');
  const [currentItem, setCurrentItem] = useState<Partial<OrgItem>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchName, setSearchName] = useState<string>('');

  const orgsQuery = useQuery<OrgItem[]>({
    queryKey: ['sys', 'orgs', queryScope, queryIdentity.current.version],
    enabled: canList,
    queryFn: async () => {
      if (!canAction('list')) return [];
      const res = await queryOrgs();
      if (!canAction('list')) return [];
      return (res?.data ?? []) as OrgItem[];
    },
  });

  const allData = canList ? (orgsQuery.data ?? []) : [];
  const live = useRef({ allData, selectedRowKeys, searchName });
  live.current = { allData, selectedRowKeys, searchName };
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
  const refresh = () => {
    if (canAction('list')) return orgsQuery.refetch();
  };

  const handleAdd = (record?: OrgItem) => {
    if (
      !canAction('create') ||
      (record && (record.status !== '0001' || record.frozen === 9999))
    )
      return;
    view.close();
    setCurrentItem(record ? { parentId: record.id } : {});
    setOperateType('create');
  };

  const handleEdit = (record: OrgItem) => {
    if (!canWrite() || record.status !== '0001' || record.frozen === 9999)
      return;
    if (!record.id) {
      modal.warning({ title: '提示', content: '没有选择记录' });
      return;
    }
    setCurrentItem({ id: record.id });
    setOperateType('edit');
    void view.read(record.id, async () => {
      if (!canWrite()) throw new Error('无权限编辑部门');
      const res = await getOrg(record.id);
      if (!canWrite()) throw new Error('权限已变更');
      return res;
    });
  };

  const handleDelete = async (record: OrgItem) => {
    if (!canAction('delete')) return;
    const current = findTreeNode(live.current.allData, record.id);
    if (!current || current.frozen === 9999 || current.status !== '0001')
      return;
    const [blockItem] = getDeleteBlockers(live.current.allData, [record.id]);
    if (blockItem) {
      msg.error(`错误：[${record.name}] 存在子节点，无法删除`);
      return;
    }
    const res = await deleteOrgs([record.id]);
    if (res.success) {
      setSelectedRowKeys((keys) => keys.filter((key) => key !== record.id));
      refresh();
    }
  };

  const handleBatchDelete = async (ids: string[]) => {
    if (
      !canAction('delete') ||
      !ids.length ||
      ids.length !== live.current.selectedRowKeys.length ||
      !ids.every((id) => live.current.selectedRowKeys.includes(id))
    )
      return;
    if (
      ids.some((id) => {
        const record = findTreeNode(live.current.allData, id);
        return !record || record.frozen === 9999 || record.status === '9999';
      })
    )
      return;
    const [blockItem] = getDeleteBlockers(live.current.allData, ids);
    if (blockItem) {
      msg.error(`错误：[${blockItem.name}] 存在子节点，无法删除`);
      return;
    }
    const res = await deleteOrgs(ids);
    if (res.success) {
      setSelectedRowKeys([]);
      refresh();
    }
  };

  const confirmDelete = (record: OrgItem) => {
    if (!canAction('delete')) return;
    modal.confirm({
      title: '确定要删除吗？',
      centered: true,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => canAction('delete') && handleDelete(record),
    });
  };

  const confirmBatchDelete = () => {
    if (!canAction('delete')) return;
    const ids = [...live.current.selectedRowKeys];
    modal.confirm({
      title: '确定要删除选中的条目吗?',
      centered: true,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => canAction('delete') && handleBatchDelete(ids),
    });
  };

  const handleSort = async (record: OrgItem, direction: 'up' | 'down') => {
    if (!canAction('sort') || live.current.searchName) return;
    const move = getSiblingMove(live.current.allData, record.id, direction);
    if (!move) return;
    if (
      move.current.status !== '0001' ||
      move.current.frozen === 9999 ||
      move.target.frozen === 9999
    )
      return;
    const res = await sortOrgs({
      id: record.id,
      oldSort: move.current.orders,
      newSort: move.target.orders,
    });
    if (res.success) refresh();
  };

  const columns: TableColumnsType<OrgItem> = [
    textColumn<OrgItem>('单位/部门名称', 'name', 240),
    textColumn<OrgItem>('所属单位/部门', 'parentName', 240),
    {
      title: '排序',
      dataIndex: 'orders',
      width: 150,
      align: 'right',
      render: (text, record) => {
        if (record.status !== '0001') return '';
        if (searchName || !canSort || record.frozen === 9999) return text;
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
          {canRead(record) && (
            <Button type="link" size="small" onClick={() => handleView(record)}>
              查看
            </Button>
          )}
          {record.status === '0001' && record.frozen !== 9999 && (
            <div
              style={{ textAlign: 'center' }}
              onDoubleClick={(event) => event.stopPropagation()}
            >
              {canSave && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleAdd(record)}
                >
                  添加下级
                </Button>
              )}
              {canAction('update') && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleEdit(record)}
                >
                  编辑
                </Button>
              )}
              {canDelete && (
                <Button
                  type="link"
                  size="small"
                  danger
                  className="eva-delete-link"
                  onClick={() => confirmDelete(record)}
                >
                  删除
                </Button>
              )}
            </div>
          )}
        </ActionGroup>
      ),
    },
  ];

  return (
    <PageContainer
      className="eva-list-page"
      header={{ title: false, subTitle: false }}
      title="组织（部门）管理"
      subTitle="系统组织架构管理维护"
    >
      <div className="eva-ribbon">
        <div>
          {canSave && (
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => handleAdd()}
              loading={orgsQuery.isLoading}
            >
              新增部门
            </Button>
          )}
          {canDelete && selectedRowKeys.length > 0 && (
            <>
              <Divider type="vertical" />
              <Button danger onClick={confirmBatchDelete}>
                删除部门
              </Button>
            </>
          )}
        </div>
        <div>
          <Search
            disabled={!canList}
            placeholder="输入组织名称以搜索"
            onSearch={(value) => {
              setSelectedRowKeys([]);
              setSearchName(value.trim());
            }}
            style={{ width: 280 }}
          />
        </div>
      </div>
      <div className="eva-body">
        {canDelete && selectedRowKeys.length > 0 && (
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
        <Table<OrgItem>
          className="eva-page-table"
          size="small"
          pagination={false}
          dataSource={data}
          loading={orgsQuery.isLoading}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1100, y: '100%' }}
          rowSelection={
            searchName || !canDelete
              ? undefined
              : {
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys(keys.map(String)),
                  getCheckboxProps: (record) => ({
                    disabled: record.frozen === 9999,
                  }),
                }
          }
          onRow={(record) => viewRow(() => handleView(record))}
          rowClassName={(record) =>
            clsx({
              'eva-locked': record.frozen === 1,
              'eva-readonly': record.frozen === 9999,
            })
          }
        />
      </div>

      {operateType !== '' && (
        <OrgAOEForm
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
          canAction={canAction}
        />
      )}
    </PageContainer>
  );
};

export default SysOrganizationPage;
