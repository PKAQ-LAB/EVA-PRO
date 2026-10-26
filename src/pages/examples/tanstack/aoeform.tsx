import { useForm, useStore } from '@tanstack/react-form';
import { history } from '@umijs/max';
import { Alert, App, Button, Drawer, Form, Input, Select, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import useFormDialogStyles from '@/components/FormDialog/useStyles';
import RecordAuditFields from '@/components/RecordAuditFields';
import type { LocalRecord, LocalRecordValues } from './data.d';
import { validateValues } from './rules';

export type RecordMode = 'create' | 'edit' | 'view';

interface Props {
  mode: RecordMode;
  record: LocalRecord | null;
  onSave: (values: LocalRecordValues) => Promise<unknown>;
  onClose: () => void;
}

export default function AOEForm({ mode, record, onSave, onClose }: Props) {
  const { message, modal } = App.useApp();
  const styles = useFormDialogStyles();
  const [error, setError] = useState('');
  const isView = mode === 'view';
  const currentMode = useRef(mode);
  currentMode.current = mode;
  const active = useRef(true);
  const canWrite = () => active.current && currentMode.current !== 'view';
  const saving = useRef(false);
  const unblock = useRef<(() => void) | null>(null);
  const confirmation = useRef<ReturnType<typeof modal.confirm> | null>(null);
  const form = useForm({
    defaultValues: {
      name: record?.name ?? '',
      code: record?.code ?? '',
      status: record?.status ?? 'enabled',
      remark: record?.remark ?? '',
    } satisfies LocalRecordValues,
    validators: {
      onSubmit: ({ value }) => {
        const fields = validateValues(value);
        return Object.keys(fields).length ? { fields } : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      if (!canWrite() || saving.current) return;
      saving.current = true;
      setError('');
      try {
        await onSave(value);
        if (!canWrite()) return;
        unblock.current?.();
        unblock.current = null;
        message.success('保存成功');
        onClose();
      } catch (failure) {
        if (!canWrite()) return;
        setError(
          failure instanceof Error ? failure.message : '保存失败，请重试',
        );
      } finally {
        saving.current = false;
      }
    },
  });
  const dirty = useStore(form.store, (state) => state.isDirty);
  const busy = useStore(form.store, (state) => state.isSubmitting);
  const latest = useRef({ dirty, onClose });
  latest.current = { dirty, onClose };

  const attemptLeave = (leave: () => void) => {
    if (currentMode.current === 'view') {
      leave();
      return;
    }
    if (saving.current) {
      message.info('加载中...');
      return;
    }
    if (!latest.current.dirty) {
      leave();
      return;
    }
    if (confirmation.current) return;
    confirmation.current = modal.confirm({
      title: '放弃未保存的修改？',
      okText: '放弃修改',
      cancelText: '继续编辑',
      onCancel: () => {
        confirmation.current = null;
      },
      onOk: () => {
        confirmation.current = null;
        if (saving.current) {
          message.info('加载中...');
          return;
        }
        unblock.current?.();
        unblock.current = null;
        leave();
      },
    });
  };
  const leave = useRef(attemptLeave);
  leave.current = attemptLeave;
  useEffect(() => {
    if (isView || (!dirty && !busy)) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const detach = history.block((transition) =>
      leave.current(transition.retry),
    );
    unblock.current = detach;
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      detach();
      if (unblock.current === detach) unblock.current = null;
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [dirty, busy, isView]);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      confirmation.current?.destroy();
    };
  }, []);

  return (
    <Drawer
      open
      title={
        mode === 'view' ? '查看记录' : mode === 'edit' ? '编辑记录' : '新增记录'
      }
      size={560}
      closable={{ placement: 'end' }}
      mask={{ closable: false }}
      styles={styles}
      onClose={() => attemptLeave(latest.current.onClose)}
      destroyOnHidden
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={() => attemptLeave(latest.current.onClose)}>
            {isView ? '关闭' : '取消'}
          </Button>
          {!isView && (
            <Button
              type="primary"
              htmlType="submit"
              form="local-record-form"
              loading={busy}
            >
              保存
            </Button>
          )}
        </Space>
      }
    >
      {error && (
        <Alert
          className="eva-view-notice"
          type="error"
          showIcon
          title={error}
        />
      )}
      {isView ? (
        <div>
          <Form.Item label="名称">
            <span className="eva-view-value">
              {record?.name?.trim() || '—'}
            </span>
          </Form.Item>
          <Form.Item label="编码">
            <span className="eva-view-value">
              {record?.code?.trim() || '—'}
            </span>
          </Form.Item>
          <Form.Item label="状态">
            <span className="eva-view-value">
              {record?.status === 'enabled'
                ? '启用'
                : record?.status === 'disabled'
                  ? '停用'
                  : '—'}
            </span>
          </Form.Item>
          <Form.Item label="备注">
            <span className="eva-view-value eva-view-value-multiline">
              {record?.remark?.trim() || '—'}
            </span>
          </Form.Item>
          <RecordAuditFields record={{}} />
        </div>
      ) : (
        <form
          id="local-record-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (currentMode.current === 'view') return;
            void form.handleSubmit();
          }}
        >
          <form.Field name="name">
            {(field) => (
              <Form.Item
                label="名称"
                htmlFor="local-record-name"
                required
                validateStatus={
                  field.state.meta.errors.length ? 'error' : undefined
                }
                help={
                  field.state.meta.errors.length ? (
                    <span id="local-record-name-error">
                      {field.state.meta.errors.join('，')}
                    </span>
                  ) : undefined
                }
              >
                <Input
                  id="local-record-name"
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={
                    field.state.meta.errors.length
                      ? 'local-record-name-error'
                      : undefined
                  }
                  value={field.state.value}
                  maxLength={50}
                  disabled={isView || busy}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    if (currentMode.current !== 'view')
                      field.handleChange(event.target.value);
                  }}
                />
              </Form.Item>
            )}
          </form.Field>
          <form.Field name="code">
            {(field) => (
              <Form.Item
                label="编码"
                htmlFor="local-record-code"
                required
                validateStatus={
                  field.state.meta.errors.length ? 'error' : undefined
                }
                help={
                  field.state.meta.errors.length ? (
                    <span id="local-record-code-error">
                      {field.state.meta.errors.join('，')}
                    </span>
                  ) : undefined
                }
              >
                <Input
                  id="local-record-code"
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={
                    field.state.meta.errors.length
                      ? 'local-record-code-error'
                      : undefined
                  }
                  value={field.state.value}
                  maxLength={32}
                  disabled={isView || busy}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    if (currentMode.current !== 'view')
                      field.handleChange(event.target.value);
                  }}
                />
              </Form.Item>
            )}
          </form.Field>
          <form.Field name="status">
            {(field) => (
              <Form.Item label="状态" htmlFor="local-record-status" required>
                <Select<LocalRecordValues['status']>
                  id="local-record-status"
                  value={field.state.value}
                  disabled={isView || busy}
                  onChange={(value) => {
                    if (currentMode.current !== 'view')
                      field.handleChange(value);
                  }}
                  options={[
                    { value: 'enabled', label: '启用' },
                    { value: 'disabled', label: '停用' },
                  ]}
                />
              </Form.Item>
            )}
          </form.Field>
          <form.Field name="remark">
            {(field) => (
              <Form.Item
                label="备注"
                htmlFor="local-record-remark"
                validateStatus={
                  field.state.meta.errors.length ? 'error' : undefined
                }
                help={
                  field.state.meta.errors.length ? (
                    <span id="local-record-remark-error">
                      {field.state.meta.errors.join('，')}
                    </span>
                  ) : undefined
                }
              >
                <Input.TextArea
                  id="local-record-remark"
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={
                    field.state.meta.errors.length
                      ? 'local-record-remark-error'
                      : undefined
                  }
                  value={field.state.value}
                  maxLength={200}
                  rows={4}
                  disabled={isView || busy}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    if (currentMode.current !== 'view')
                      field.handleChange(event.target.value);
                  }}
                />
              </Form.Item>
            )}
          </form.Field>
        </form>
      )}
    </Drawer>
  );
}
