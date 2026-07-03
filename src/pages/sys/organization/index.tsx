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
import React, { useState } from 'react';
import { getNodeBorther, hasChildren } from '@/utils/DataHelper';
import { frozenText } from '../status';
import OrgAOEForm, { type OperateType } from './aoeform';
import type { OrgItem } from './data.d';
import { deleteOrgs, getOrg, queryOrgs, sortOrgs } from './service';

const { Search } = Input;

const SysOrganizationPage: React.FC = () => {
  const intl = useIntl();
  const { message: msg, modal } = App.useApp();
  const [operateType, setOperateType] = useState<OperateType>('');
  const [currentItem, setCurrentItem] = useState<Partial<OrgItem>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchName, setSearchName] = useState<string>('');

  const orgsQuery = useQuery<OrgItem[]>({
    queryKey: ['sys', 'orgs', { name: searchName }],
    queryFn: async () => {
      const res = await queryOrgs(
        searchName ? { name: searchName } : undefined,
      );
      return (res?.data ?? []) as OrgItem[];
    },
  });

  const data = orgsQuery.data ?? [];
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
    const blockItem = hasChildren(data as never, [record.id]);
    if (record.isLeaf || blockItem) {
      msg.error(`错误：[${record.name}] 存在子节点，无法删除`);
      return;
    }
    const res = await deleteOrgs([record.id]);
    if (res.success) refresh();
  };

  const handleBatchDelete = async () => {
    const blockItem = hasChildren(data as never, selectedRowKeys);
    if (blockItem) {
      msg.error(`错误：[${blockItem}] 存在子节点，无法删除`);
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

  const handleSort = async (
    nodes: OrgItem[],
    record: OrgItem,
    direction: 'up' | 'down',
  ) => {
    const index = nodes.findIndex((node) => node.id === record.id);
    if (index < 0) return;
    const target = direction === 'up' ? nodes[index - 1] : nodes[index + 1];
    if (!target) return;
    const res = await sortOrgs({
      id: record.id,
      oldSort: record.orders,
      newSort: target.orders,
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
        const brother = getNodeBorther(
          data as never,
          record.parentId ?? '',
        ) as OrgItem[];
        const index = brother.findIndex((node) => node.id === record.id);
        const size = brother.length;
        return (
          <div>
            {text}
            <Divider type="vertical" />
            {index >= 0 && size !== 0 && index !== size - 1 ? (
              <CaretDownOutlined
                onClick={(event) => {
                  event.stopPropagation();
                  handleSort(brother, record, 'down');
                }}
                style={{ color: '#098FFF', cursor: 'pointer' }}
              />
            ) : (
              <CaretDownOutlined style={{ opacity: 0.3 }} />
            )}
            <Divider type="vertical" />
            {index >= 0 && size !== 0 && index !== 0 ? (
              <CaretUpOutlined
                onClick={(event) => {
                  event.stopPropagation();
                  handleSort(brother, record, 'up');
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
          <div>
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
            onSearch={(value) => setSearchName(value)}
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
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys.map(String)),
            getCheckboxProps: (record) => ({
              disabled: record.frozen === 9999,
            }),
          }}
          onRow={(record) => ({
            onDoubleClick: () => handleEdit(record),
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
          data={data}
          onClose={() => setOperateType('')}
          onSuccess={refresh}
        />
      )}
    </PageContainer>
  );
};

export default SysOrganizationPage;
