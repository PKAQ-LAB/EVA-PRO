import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { useModel } from '@umijs/max';
import { Alert, App, Button, Spin } from 'antd';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import APIS from '@/apis';
import { SideLayout } from '@/components';
import { canRequestResource } from '@/utils/resourcePermission';
import useLeaveGuard from '../account/useLeaveGuard';
import DictAOEForm, { type OperateType } from './aoeform';
import type { DictItem } from './data.d';
import DictListView from './list';
import styles from './list.module.css';
import {
  completeContract,
  dictIdentity,
  hasCategory,
  isReadonlyDict,
} from './readonly';
import {
  type DictListResponse,
  deleteDict,
  getDict,
  queryDicts,
} from './service';

const SysDictionaryPage: React.FC = () => {
  const {
    initialState,
    loading: bootLoading,
    error: bootError,
  } = useModel('@@initialState');
  const queryScope = useId();
  const user = initialState?.currentUser;
  const identity = useRef({ user, version: 0 });
  if (identity.current.user !== user)
    identity.current = { user, version: identity.current.version + 1 };
  const version = identity.current.version;
  const accessRef = useRef(
    (_method: string, _path: string) => false as boolean,
  );
  accessRef.current = (method, path) =>
    !bootLoading && !bootError && canRequestResource(user, method, path);
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
    identity: `dictionary:${version}:${dictIdentity(currentItem)}:${operateType}`,
    dirty,
    busy: busy || loading,
    isBusy: () => busyRef.current || loadingRef.current,
    onClose: () => pendingAction.current(),
    onClean: () => onDirtyChange(false),
    onBlocked: () => msg.info('加载中...'),
    modal,
  });
  const changeSelection = (action: () => void) => {
    pendingAction.current = () => {
      if (identity.current.version === version) action();
    };
    guard.requestClose();
  };
  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );

  const dictsQuery = useQuery<DictListResponse>({
    queryKey: ['sys', 'dicts', queryScope, version],
    enabled: accessRef.current('GET', APIS.DICT_LIST),
    queryFn: async () => {
      if (!accessRef.current('GET', APIS.DICT_LIST))
        throw new Error('无读取权限');
      const res = await queryDicts();
      if (
        identity.current.version !== version ||
        !accessRef.current('GET', APIS.DICT_LIST)
      )
        throw new Error('身份已变更');
      if (res.success !== true) throw new Error('字典列表加载失败');
      return res;
    },
  });

  const data = accessRef.current('GET', APIS.DICT_LIST)
    ? (dictsQuery.data?.data ?? [])
    : [];
  const grouped =
    !dictsQuery.isError &&
    completeContract(data, dictsQuery.data?.businessWritable);
  const ready = !dictsQuery.isFetching && !dictsQuery.isError;
  const live = useRef({
    data,
    grouped,
    ready,
    businessWritable: dictsQuery.data?.businessWritable,
    currentItem,
    version,
  });
  live.current = {
    data,
    grouped,
    ready,
    businessWritable: dictsQuery.data?.businessWritable,
    currentItem,
    version,
  };
  const canCreate = () =>
    live.current.ready &&
    live.current.grouped &&
    live.current.businessWritable === true &&
    accessRef.current('POST', APIS.DICT_EDIT);
  const canWrite = (
    record: Partial<DictItem>,
    path: string = APIS.DICT_EDIT,
    method = 'POST',
  ) => {
    const state = live.current;
    const current = state.data.find(
      (row) => dictIdentity(row) === dictIdentity(record),
    );
    return (
      identity.current.version === state.version &&
      state.ready &&
      state.grouped &&
      state.businessWritable === true &&
      !isReadonlyDict(record) &&
      current !== undefined &&
      !isReadonlyDict(current) &&
      accessRef.current(method, path)
    );
  };
  const canDelete = (record: DictItem) =>
    canWrite(record, `${APIS.DICT_DEL}/${record.id}`, 'GET') &&
    !record.lines?.some((line) => line.frozen === 9999);
  const permissionRef = useRef<() => boolean>(() => false);
  permissionRef.current = () =>
    live.current.currentItem.id
      ? canWrite(live.current.currentItem)
      : canCreate();
  useEffect(() => {
    requestId.current += 1;
    setCurrentItem({});
    setOperateType('');
    setDetailError('');
    setLoading(false);
    loadingRef.current = false;
  }, [version]);
  const refresh = () => dictsQuery.refetch();

  const refreshDictState = async () => {
    const sync = initialState?.fetchDict?.();
    await refresh();
    if (identity.current.version !== version) return;
    await sync;
  };

  const handleCreate = () => {
    if (!canCreate()) return;
    changeSelection(() => {
      if (!canCreate()) return;
      requestId.current += 1;
      setDetailError('');
      setCurrentItem({});
      setOperateType('create');
    });
  };

  const handleEdit = (record: DictItem) => {
    if (!accessRef.current('GET', `${APIS.DICT_GET}/${record.id}`)) return;
    if (
      dictIdentity(currentItem) === dictIdentity(record) &&
      operateType === 'edit'
    )
      return;
    const previousDirty = dirtyRef.current;
    changeSelection(() => {
      const id = ++requestId.current;
      loadingRef.current = true;
      setLoading(true);
      setDetailError('');
      void getDict(record.id, hasCategory(record) ? record.category : undefined)
        .then((res) => {
          if (
            id !== requestId.current ||
            identity.current.version !== version ||
            !accessRef.current('GET', `${APIS.DICT_GET}/${record.id}`)
          )
            return;
          if (res.success !== true || !res.data) {
            throw new Error('未返回字典详情');
          }
          if (res.data.id == null || String(res.data.id) !== String(record.id))
            throw new Error('字典身份不匹配');
          if (hasCategory(record) && res.data.category !== record.category)
            throw new Error('字典分类不匹配');
          setCurrentItem(res.data);
          setOperateType(
            !canWrite(record) || isReadonlyDict(res.data) ? 'view' : 'edit',
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
    if (!canDelete(record)) return undefined;
    const previousDirty = dirtyRef.current;
    const remove = async () => {
      if (identity.current.version !== version || !canDelete(record)) return;
      if (loadingRef.current || busyRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const res = await deleteDict(record.id);
        if (identity.current.version !== version) return;
        if (!res.success) throw new Error('删除失败');
        if (dictIdentity(currentItem) === dictIdentity(record)) {
          setCurrentItem({});
          setOperateType('');
        }
        msg.success('删除成功');
        await refreshDictState();
      } catch {
        if (identity.current.version !== version) return;
        onDirtyChange(previousDirty);
        msg.error('删除失败，请重试');
      } finally {
        if (identity.current.version === version) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    };
    if (dictIdentity(currentItem) === dictIdentity(record)) {
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
              grouped={grouped}
              canCreate={canCreate()}
              canDelete={canDelete}
              data={data}
              loading={dictsQuery.isLoading}
              onCreate={handleCreate}
              onEdit={handleEdit}
              selectedId={dictIdentity(currentItem)}
              onDelete={handleDelete}
            />
          }
        >
          {!grouped && !dictsQuery.isLoading && (
            <Alert
              className="eva-view-notice"
              type="warning"
              showIcon
              title="分类维护契约尚未完整提供，当前字典仅供读取"
            />
          )}
          {detailError && <Alert type="error" showIcon title={detailError} />}
          <Spin spinning={loading} description="加载中...">
            <DictAOEForm
              operateType={operateType}
              setOperateType={setOperateType}
              currentItem={currentItem}
              loading={loading}
              canWrite={() =>
                identity.current.version === version && permissionRef.current()
              }
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
