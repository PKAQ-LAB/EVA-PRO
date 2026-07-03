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
import IconMap from '@/appicon';
import { getNodeBorther, hasChildren } from '@/utils/DataHelper';
import { frozenText } from '../status';
import ModuleAOEForm, { type OperateType } from './aoeform';
import type { ModuleItem } from './data.d';
import { deleteModules, getModule, queryModules, sortModules } from './service';

const { Search } = Input;

const SysModulePage: React.FC = () => {
  const intl = useIntl();
  const { message: msg, modal } = App.useApp();
  const [operateType, setOperateType] = useState<OperateType>('');
  const [currentItem, setCurrentItem] = useState<Partial<ModuleItem>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchName, setSearchName] = useState<string>('');

  const modulesQuery = useQuery<ModuleItem[]>({
    queryKey: ['sys', 'modules', { name: searchName }],
    queryFn: async () => {
      const res = await queryModules(
        searchName ? { name: searchName } : undefined,
      );
      return (res?.data ?? []) as ModuleItem[];
    },
  });

  const data = modulesQuery.data ?? [];
  const refresh = () => modulesQuery.refetch();

  const handleAdd = (record?: ModuleItem) => {
    setCurrentItem(record ? { parentId: record.id } : {});
    setOperateType('create');
  };

  const handleEdit = async (record: ModuleItem) => {
    if (!record.id) {
      modal.warning({ title: '提示', content: '没有选择记录' });
      return;
    }
    const res = await getModule(record.id);
    if (res.data) {
      setCurrentItem(res.data);
      setOperateType('edit');
    }
  };

  const handleDelete = async (record: ModuleItem) => {
    const blockItem = hasChildren(data as never, [record.id]);
    if (record.isLeaf || blockItem) {
      msg.error(`错误：[${record.name}] 存在子节点，无法删除`);
      return;
    }
    const res = await deleteModules([record.id]);
    if (res.success) refresh();
  };

  const handleBatchDelete = async () => {
    const blockItem = hasChildren(data as never, selectedRowKeys);
    if (blockItem) {
      msg.error(`错误：[${blockItem}] 存在子节点，无法删除`);
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

  const handleSort = async (
    nodes: ModuleItem[],
    index: number,
    direction: 'up' | 'down',
  ) => {
    const target = direction === 'up' ? nodes[index - 1] : nodes[index + 1];
    if (!target) return;
    const res = await sortModules([
      {
        id: nodes[index].id,
        orders: direction === 'up' ? index - 1 : index + 1,
      },
      { id: target.id, orders: index },
    ]);
    if (res.success) refresh();
  };

  const columns: TableColumnsType<ModuleItem> = [
    { title: '模块名称', dataIndex: 'name' },
    {
      title: '图标',
      dataIndex: 'icon',
      render: (text) => (text ? (IconMap[text as string] ?? text) : null),
    },
    { title: 'Path', dataIndex: 'path' },
    { title: '上级模块', dataIndex: 'parentName' },
    {
      title: '排序',
      dataIndex: 'orders',
      render: (text, record, index) => {
        const brother = getNodeBorther(
          data as never,
          record.parentId ?? '',
        ) as ModuleItem[];
        const size = brother?.length ?? 0;
        return (
          <div>
            {text}
            <Divider type="vertical" />
            {size !== 0 && index !== size - 1 ? (
              <CaretDownOutlined
                onClick={() => handleSort(brother, index, 'down')}
                style={{ color: '#098FFF', cursor: 'pointer' }}
              />
            ) : (
              <CaretDownOutlined style={{ opacity: 0.3 }} />
            )}
            <Divider type="vertical" />
            {size !== 0 && index !== 0 ? (
              <CaretUpOutlined
                onClick={() => handleSort(brother, index, 'up')}
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
      render: (_, record) => (
        <div>
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
        </div>
      ),
    },
  ];

  return (
    <PageContainer title="模块管理" subTitle="系统模块（菜单）管理维护">
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
        <Table<ModuleItem>
          size="small"
          columns={columns}
          dataSource={data}
          loading={modulesQuery.isLoading}
          rowKey="id"
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys.map(String)),
            getCheckboxProps: (record) => ({
              disabled: record.frozen === 9999,
            }),
          }}
          rowClassName={(record) =>
            clsx({
              'eva-locked': record.frozen === 1,
              'eva-disabled': record.frozen === 9999,
            })
          }
          expandable={{ defaultExpandAllRows: true }}
        />
      </div>

      {operateType !== '' && (
        <ModuleAOEForm
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

export default SysModulePage;
