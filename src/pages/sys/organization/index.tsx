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
import React, { useMemo, useState } from 'react';
import { canInspectPlatformTenants } from '@/productMode';
import {
  filterTree,
  getDeleteBlockers,
  getSiblingMove,
} from '@/utils/treeOperations';
import { frozenText } from '../status';
import OrgAOEForm, { type OperateType } from './aoeform';
import type { OrgItem } from './data.d';
import PlatformOrganizationPage from './platform';
import { deleteOrgs, getOrg, queryOrgs, sortOrgs } from './service';

const { Search } = Input;

const TenantOrganizationPage: React.FC = () => {
  const intl = useIntl();
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
    setCurrentItem(record ? { parentId: record.id } : {});
    setOperateType('create');
  };

  const handleEdit = async (record: OrgItem) => {
    if (!record.id) {
      modal.warning({ title: '提示', content: '没有选择记录' });
      return;
    }
    const res = await getOrg(record.id);
    if (res.data) {
      setCurrentItem(res.data);
      setOperateType('edit');
    }
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
    { title: '单位/部门名称', dataIndex: 'name' },
    { title: '所属单位/部门', dataIndex: 'parentName' },
    {
      title: '排序',
      dataIndex: 'orders',
      render: (text, record) => {
        if (record.status !== '0001') return '';
        if (searchName) return text;
        const moveDown = getSiblingMove(allData, record.id, 'down');
        const moveUp = getSiblingMove(allData, record.id, 'up');
        return (
          <div>
            {text}
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
      render: (_, record) => frozenText(intl, record.frozen),
    },
    {
      title: '操作',
      render: (_, record) =>
        record.status === '0001' && (
          <div onDoubleClick={(event) => event.stopPropagation()}>
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
        ),
    },
  ];

  return (
    <PageContainer title="组织（部门）管理" subTitle="系统组织架构管理维护">
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
          pagination={false}
          dataSource={data}
          loading={orgsQuery.isLoading}
          columns={columns}
          rowKey="id"
          scroll={{ y: 'calc(100vh - 360px)' }}
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
          onRow={(record) => ({
            onDoubleClick: () => {
              if (record.status === '0001') {
                handleEdit(record);
              }
            },
          })}
          rowClassName={(record) =>
            clsx({
              'eva-locked': record.frozen === 1,
              'eva-disabled': record.frozen === 9999,
            })
          }
        />
      </div>

      {operateType !== '' && (
        <OrgAOEForm
          operateType={operateType}
          currentItem={currentItem}
          data={allData}
          onClose={() => setOperateType('')}
          onSuccess={refresh}
        />
      )}
    </PageContainer>
  );
};

const SysOrganizationPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  return canInspectPlatformTenants(initialState?.currentUser) ? (
    <PlatformOrganizationPage />
  ) : (
    <TenantOrganizationPage />
  );
};

export default SysOrganizationPage;
