import { history } from '@umijs/max';
import type { App } from 'antd';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

interface LeaveGuardOptions {
  identity: string;
  dirty: boolean;
  busy: boolean;
  isBusy: () => boolean;
  onClose: () => void;
  onClean: () => void;
  onBlocked: () => void;
  modal: ReturnType<typeof App.useApp>['modal'];
}

/** 仅保护当前用户表单，确认放弃后解除阻断再重试原导航。 */
export default function useLeaveGuard(options: LeaveGuardOptions) {
  const latest = useRef(options);
  const session = useMemo(() => ({}), [options.identity]);
  const activeSession = useRef<object | null>(null);
  const detach = useRef<(() => void) | null>(null);
  const confirmation = useRef<{ destroy: () => void } | null>(null);

  useLayoutEffect(() => {
    latest.current = options;
  });
  useLayoutEffect(() => {
    activeSession.current = session;
    return () => {
      activeSession.current = null;
      detach.current?.();
      detach.current = null;
      confirmation.current?.destroy();
      confirmation.current = null;
    };
  }, [session]);

  const isCurrent = () => activeSession.current === session;
  const release = () => {
    if (!isCurrent()) return;
    detach.current?.();
    detach.current = null;
    latest.current.onClean();
  };
  const attemptLeave = (leave: () => void) => {
    if (!isCurrent()) return;
    if (latest.current.isBusy()) {
      latest.current.onBlocked();
      return;
    }
    if (!latest.current.dirty) {
      release();
      leave();
      return;
    }
    if (confirmation.current) return;
    confirmation.current = latest.current.modal.confirm({
      title: '放弃未保存的修改？',
      okText: '放弃修改',
      cancelText: '继续编辑',
      onCancel: () => {
        if (isCurrent()) confirmation.current = null;
      },
      onOk: () => {
        // 弹出确认后可能开始上传/保存，或已切换、卸载表单。
        if (!isCurrent()) return;
        confirmation.current = null;
        if (latest.current.isBusy()) {
          latest.current.onBlocked();
          return;
        }
        release();
        leave();
      },
    });
  };

  useEffect(() => {
    if (!options.dirty && !options.busy) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (latest.current.dirty || latest.current.isBusy()) {
        event.preventDefault();
        // 浏览器仅允许原生离开提示，不指定自定义提示文本。
        event.returnValue = '';
      }
    };
    const unblock = history.block((transition) =>
      attemptLeave(transition.retry),
    );
    const cleanup = () => {
      unblock();
      window.removeEventListener('beforeunload', beforeUnload);
    };
    detach.current = cleanup;
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      cleanup();
      if (detach.current === cleanup) detach.current = null;
    };
  }, [options.identity, options.dirty, options.busy]);

  return {
    isCurrent,
    release,
    requestClose: () => attemptLeave(() => latest.current.onClose()),
  };
}
