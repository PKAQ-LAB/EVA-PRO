import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import React, { useState } from 'react';
import { SideLayout } from '@/components';
import DictAOEForm, { type OperateType } from './aoeform';
import type { DictItem } from './data.d';
import DictListView from './list';
import { deleteDict, getDict, queryDicts } from './service';

const SysDictionaryPage: React.FC = () => {
  const { message: msg } = App.useApp();
  const [operateType, setOperateType] = useState<OperateType>('');
  const [currentItem, setCurrentItem] = useState<Partial<DictItem>>({});

  const dictsQuery = useQuery<DictItem[]>({
    queryKey: ['sys', 'dicts'],
    queryFn: async () => {
      const res = await queryDicts();
      return (res?.data ?? []) as DictItem[];
    },
  });

  const data = dictsQuery.data ?? [];
  const refresh = () => dictsQuery.refetch();

  const handleCreate = () => {
    setCurrentItem({});
    setOperateType('create');
  };

  const handleEdit = async (record: DictItem) => {
    if (record.parentId === '0' || !record.parentId) return;
    const res = await getDict(record.id);
    if (res.data) {
      setCurrentItem(res.data);
      setOperateType('edit');
    }
  };

  const handleDelete = async (record: DictItem) => {
    const res = await deleteDict(record.id);
    if (res.success) {
      msg.success('删除成功');
      refresh();
    }
  };

  return (
    <PageContainer title="字典管理" subTitle="系统字典（码表）管理维护">
      <div className="eva-body">
        <SideLayout
          title="字典分组"
          width={400}
          bodyStyle={{ padding: 0 }}
          layoutStyle={{ minHeight: 'calc(100vh - 215px)' }}
          body={
            <DictListView
              data={data}
              loading={dictsQuery.isLoading}
              onCreate={handleCreate}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          }
        >
          <DictAOEForm
            operateType={operateType}
            setOperateType={setOperateType}
            currentItem={currentItem}
            onSuccess={refresh}
          />
        </SideLayout>
      </div>
    </PageContainer>
  );
};

export default SysDictionaryPage;
