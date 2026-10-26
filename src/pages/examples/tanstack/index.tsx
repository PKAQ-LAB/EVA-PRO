import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, App, Button } from 'antd';
import { useEffect, useState } from 'react';
import AOEForm, { type RecordMode } from './aoeform';
import type { LocalRecord, LocalRecordValues } from './data.d';
import RecordList from './list';
import {
  deleteRecord,
  listRecords,
  recordsQueryKey,
  saveRecord,
  storageKey,
} from './service';

const emptyRecords: LocalRecord[] = [];

export default function LocalRecordsPage() {
  const client = useQueryClient();
  const { message, modal } = App.useApp();
  const [dialog, setDialog] = useState<{
    mode: RecordMode;
    record: LocalRecord | null;
  }>();
  const query = useQuery({
    queryKey: recordsQueryKey,
    queryFn: listRecords,
    retry: false,
    networkMode: 'always',
  });
  const save = useMutation({
    mutationFn: ({ values, id }: { values: LocalRecordValues; id?: string }) =>
      saveRecord(values, id),
    networkMode: 'always',
    onSuccess: (records) => client.setQueryData(recordsQueryKey, records),
  });
  const remove = useMutation({
    mutationFn: deleteRecord,
    networkMode: 'always',
    onSuccess: (records) => client.setQueryData(recordsQueryKey, records),
  });
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null)
        void client.invalidateQueries({ queryKey: recordsQueryKey });
    };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [client]);
  const confirmDelete = (record: LocalRecord) =>
    modal.confirm({
      title: '删除这条记录？',
      content: record.name,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await remove.mutateAsync(record.id);
          message.success('删除成功');
        } catch (failure) {
          message.error(
            failure instanceof Error ? failure.message : '删除失败，请重试',
          );
          throw failure;
        }
      },
    });

  return (
    <PageContainer
      header={{ title: false, subTitle: false }}
      breadcrumb={{
        items: [{ title: '本地示例' }, { title: 'TanStack Table' }],
      }}
    >
      {query.isError ? (
        <Alert
          className="eva-view-notice"
          type="error"
          showIcon
          title="本地记录读取失败"
          description={query.error.message}
          action={
            <Button
              onClick={() => void query.refetch()}
              loading={query.isFetching}
            >
              重试
            </Button>
          }
        />
      ) : (
        <RecordList
          records={query.data ?? emptyRecords}
          loading={query.isFetching}
          busy={save.isPending || remove.isPending}
          onCreate={() => setDialog({ mode: 'create', record: null })}
          onView={(record) =>
            setDialog({ mode: 'view', record: { ...record } })
          }
          onEdit={(record) => setDialog({ mode: 'edit', record })}
          onDelete={confirmDelete}
          onRefresh={() => void query.refetch()}
        />
      )}
      {dialog && (
        <AOEForm
          key={`${dialog.mode}:${dialog.record?.id ?? 'create'}`}
          mode={dialog.mode}
          record={dialog.record}
          onSave={async (values) => {
            if (dialog.mode === 'view') return;
            await save.mutateAsync({ values, id: dialog.record?.id });
          }}
          onClose={() => setDialog(undefined)}
        />
      )}
    </PageContainer>
  );
}
