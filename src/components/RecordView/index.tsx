import {
  Alert,
  Button,
  Descriptions,
  type DescriptionsProps,
  Drawer,
  Spin,
} from 'antd';
import { type MouseEvent, useEffect, useRef, useState } from 'react';

export function viewRow(onView: () => void) {
  return {
    onDoubleClick: (event: MouseEvent<HTMLElement>) => {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        target.closest(
          'button,a,input,select,textarea,label,[role="button"],[role="checkbox"],[role="radio"],[role="switch"],[role="combobox"],[contenteditable]:not([contenteditable="false"]),[data-no-row-view],.eva-table-text-tooltip,.ant-select,.ant-picker,.ant-input-number,.ant-table-row-expand-icon,.ant-table-selection-column,.ant-typography-copy',
        )
      )
        return;
      onView();
    },
  };
}

export function useRecordView<T>() {
  const sequence = useRef(0);
  const [state, setState] = useState<{
    open: boolean;
    loading: boolean;
    data?: T;
    error?: string;
  }>({ open: false, loading: false });
  useEffect(
    () => () => {
      sequence.current += 1;
    },
    [],
  );
  const close = () => {
    sequence.current += 1;
    setState({ open: false, loading: false });
  };
  const show = (data: T) => {
    sequence.current += 1;
    setState({ open: true, loading: false, data });
  };
  const read = async (
    id: string | number | undefined,
    load: () => Promise<{ success?: boolean; data?: T }>,
  ) => {
    if (id == null || String(id).trim() === '') return;
    const request = ++sequence.current;
    setState({ open: true, loading: true });
    try {
      const response = await load();
      if (request !== sequence.current) return;
      if (response.success === false || !response.data)
        throw new Error('读取失败');
      setState({ open: true, loading: false, data: response.data });
    } catch {
      if (request === sequence.current)
        setState({
          open: true,
          loading: false,
          error: '详情读取失败，请关闭后重试',
        });
    }
  };
  return { ...state, close, show, read };
}

export default function RecordView<T>({
  title,
  view,
  items,
}: {
  title: string;
  view: ReturnType<typeof useRecordView<T>>;
  items: (record: T) => NonNullable<DescriptionsProps['items']>;
}) {
  return (
    <Drawer
      title={title}
      open={view.open}
      onClose={view.close}
      size={640}
      closable={{ placement: 'end' }}
      destroyOnHidden
      extra={<Button onClick={view.close}>关闭</Button>}
    >
      {view.loading ? (
        <Spin description="加载中...">
          <div style={{ minHeight: 100 }} />
        </Spin>
      ) : view.error ? (
        <Alert type="error" showIcon title={view.error} />
      ) : view.data ? (
        <Descriptions
          bordered
          column={1}
          size="small"
          items={items(view.data).map((item) => ({
            ...item,
            children:
              item.children === '' || item.children == null
                ? '—'
                : item.children,
          }))}
        />
      ) : null}
    </Drawer>
  );
}
