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
import OrgAOEForm, { type OperateType } from './aoeform';
import type { OrgItem } from './data.d';
import { deleteOrgs, getOrg, queryOrgs, sortOrgs } from './service';

const { Search } = Input;

const SysOrganizationPage: React.FC = () => {
  const intl = useIntl();
  const view = useRecordView<OrgItem>();
  const handleView = (record: OrgItem) => {
    setCurrentItem({ id: record.id });
    setOperateType('view');
    void view.read(record.id, () => getOrg(record.id));
  };
  const { message: msg, modal } = App.useApp();
  const [operateType, setOperateType] = useState<OperateType>('');
  const [currentItem, setCurrentItem] = useState<Partial<OrgItem>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchName, setSearchName] = useState<string>('');

  const orgsQuery = useQuery<OrgItem[]>({
    queryKey: ['sys', 'orgs'],
    queryFn: async () => {
      const res = await queryOrgs();
      return (res?.data ?? []) as OrgItem[];
    },
  });

  const allData = orgsQuery.data ?? [];
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
  const refresh = () => orgsQuery.refetch();

  const handleAdd = (record?: OrgItem) => {
    view.close();
    setCurrentItem(record ? { parentId: record.id } : {});
    setOperateType('create');
  };

  const handleEdit = (record: OrgItem) => {
    if (!record.id) {
      modal.warning({ title: '提示', content: '没有选择记录' });
      return;
    }
    setCurrentItem({ id: record.id });
    setOperateType('edit');
    void view.read(record.id, () => getOrg(record.id));
  };

  const handleDelete = async (record: OrgItem) => {
    const [blockItem] = getDeleteBlockers(allData, [record.id]);
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

  const handleBatchDelete = async () => {
    const [blockItem] = getDeleteBlockers(allData, selectedRowKeys);
    if (blockItem) {
      msg.error(`错误：[${blockItem.name}] 存在子节点，无法删除`);
      return;
    }
    const res = await deleteOrgs(selectedRowKeys);
    if (res.success) {
      setSelectedRowKeys([]);
      refresh();
    }
  };

  const confirmDelete = (record: OrgItem) => {
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

  const handleSort = async (record: OrgItem, direction: 'up' | 'down') => {
    const move = getSiblingMove(allData, record.id, direction);
    if (!move) return;
    const res = await sortOrgs({
      id: record.id,
      oldSort: record.orders,
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
          {record.status === '0001' && (
            <div
              style={{ textAlign: 'center' }}
              onDoubleClick={(event) => event.stopPropagation()}
            >
              <a onClick={() => handleAdd(record)}>添加下级</a>
              <Divider type="vertical" />
              <a onClick={() => handleEdit(record)}>编辑</a>
              <Divider type="vertical" />
              <a
                className="eva-delete-link"
                onClick={() => confirmDelete(record)}
              >
                删除
              </a>
            </div>
          )}
        </ActionGroup>
      ),
    },
  ];

  return (
    <PageContainer
      header={{ title: false, subTitle: false }}
      title="组织（部门）管理"
      subTitle="系统组织架构管理维护"
    >
      <div className="eva-ribbon">
        <div>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => handleAdd()}
            loading={orgsQuery.isLoading}
          >
            新增部门
          </Button>
          {selectedRowKeys.length > 0 && (
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
        <Table<OrgItem>
          size="small"
          pagination={false}
          dataSource={data}
          loading={orgsQuery.isLoading}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1100, y: 'calc(100vh - 360px)' }}
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
        />
      )}
    </PageContainer>
  );
};

export default SysOrganizationPage;
