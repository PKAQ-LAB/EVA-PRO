import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { useModel } from '@umijs/max';
import { Alert, App, Button, Spin } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SideLayout } from '@/components';
import useLeaveGuard from '../account/useLeaveGuard';
import DictAOEForm, { type OperateType } from './aoeform';
import type { DictItem } from './data.d';
import DictListView from './list';
import styles from './list.module.css';
import { isReadonlyDict } from './readonly';
import { deleteDict, getDict, queryDicts } from './service';

const SysDictionaryPage: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { message: msg, modal } = App.useApp();
  const [operateType, setOperateType] = useState<OperateType>('');
  const [currentItem, setCurrentItem] = useState<Partial<DictItem>>({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const dirtyRef = useRef(false);
  const busyRef = useRef(false);
  const loadingRef = useRef(false);
  const requestId = useRef(0);
  const pendingAction = useRef<() => void>(() => {});
  const onDirtyChange = useCallback((value: boolean) => {
    dirtyRef.current = value;
    setDirty(value);
  }, []);
  const onBusyChange = useCallback((value: boolean) => {
    busyRef.current = value;
    setBusy(value);
  }, []);
  const guard = useLeaveGuard({
    identity: `dictionary:${currentItem.id ?? ''}:${operateType}`,
    dirty,
    busy: busy || loading,
    isBusy: () => busyRef.current || loadingRef.current,
    onClose: () => pendingAction.current(),
    onClean: () => onDirtyChange(false),
    onBlocked: () => msg.info('加载中...'),
    modal,
  });
  const changeSelection = (action: () => void) => {
    pendingAction.current = action;
    guard.requestClose();
  };
  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );

  const dictsQuery = useQuery<DictItem[]>({
    queryKey: ['sys', 'dicts'],
    queryFn: async () => {
      const res = await queryDicts();
      if (res.success === false) throw new Error('字典列表加载失败');
      return (res?.data ?? []) as DictItem[];
    },
  });

  const data = dictsQuery.data ?? [];
  const refresh = () => dictsQuery.refetch();

  const refreshDictState = async () => {
    await refresh();
    const dict = await initialState?.fetchDict?.();
    if (dict) {
      setInitialState((state) => ({
        ...state,
        dict,
      }));
    }
  };

  const handleCreate = () => {
    changeSelection(() => {
      requestId.current += 1;
      setDetailError('');
      setCurrentItem({});
      setOperateType('create');
    });
  };

  const handleEdit = (record: DictItem) => {
    if (currentItem.id === record.id && operateType === 'edit') return;
    const previousDirty = dirtyRef.current;
    changeSelection(() => {
      const id = ++requestId.current;
      loadingRef.current = true;
      setLoading(true);
      setDetailError('');
      void getDict(record.id)
        .then((res) => {
          if (id !== requestId.current) return;
          if (res.success === false || !res.data) {
            throw new Error('未返回字典详情');
          }
          setCurrentItem(res.data);
          setOperateType(
            isReadonlyDict(record) || isReadonlyDict(res.data)
              ? 'view'
              : 'edit',
          );
        })
        .catch(() => {
          if (id !== requestId.current) return;
          onDirtyChange(previousDirty);
          setDetailError('字典详情加载失败，请重新选择重试');
        })
        .finally(() => {
          if (id !== requestId.current) return;
          loadingRef.current = false;
          setLoading(false);
        });
    });
  };

  const handleDelete = (record: DictItem) => {
    if (isReadonlyDict(record)) return undefined;
    const previousDirty = dirtyRef.current;
    const remove = async () => {
      if (loadingRef.current || busyRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const res = await deleteDict(record.id);
        if (!res.success) throw new Error('删除失败');
        if (currentItem.id === record.id) {
          setCurrentItem({});
          setOperateType('');
        }
        msg.success('删除成功');
        await refreshDictState();
      } catch {
        onDirtyChange(previousDirty);
        msg.error('删除失败，请重试');
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };
    if (currentItem.id === record.id) {
      changeSelection(() => void remove());
      return undefined;
    }
    return remove();
  };

  return (
    <PageContainer
      className={styles.page}
      header={{ title: false, subTitle: false }}
      title="字典管理"
      subTitle="系统字典（码表）管理维护"
    >
      <div className="eva-body">
        {dictsQuery.isError && (
          <Alert
            type="error"
            showIcon
            title="字典列表加载失败"
            action={<Button onClick={() => void refresh()}>重试</Button>}
          />
        )}
        <SideLayout
          collapsible={false}
          title="字典分组"
          width="40%"
          bodyStyle={{ padding: 0, overflow: 'hidden', display: 'flex' }}
          layoutStyle={{ flex: '1 1 0', minHeight: 0 }}
          body={
            <DictListView
              data={data}
              loading={dictsQuery.isLoading}
              onCreate={handleCreate}
              onEdit={handleEdit}
              selectedId={currentItem.id}
              onDelete={handleDelete}
            />
          }
        >
          {detailError && <Alert type="error" showIcon title={detailError} />}
          <Spin spinning={loading} description="加载中...">
            <DictAOEForm
              operateType={operateType}
              setOperateType={setOperateType}
              currentItem={currentItem}
              loading={loading}
              onDirtyChange={onDirtyChange}
              onBusyChange={onBusyChange}
              onSuccess={refreshDictState}
            />
          </Spin>
        </SideLayout>
      </div>
    </PageContainer>
  );
};

export default SysDictionaryPage;
